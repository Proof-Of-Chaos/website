import { useEffect } from "react";
import useAppStore from '../zustand'
import { getWalletBySource} from "@talismn/connect-wallets";
import { getVoteTx } from "../data/vote-service";
import { getApi } from "../data/chain";
import toast from 'react-hot-toast';

import type { ExtrinsicStatus } from '@polkadot/types'

export const VoteState = {
    AwaitingSignature: 'AwaitingSignature',
    Ready: 'Ready',
    InBlock: 'InBlock',
    Finalized: 'Finalized',
    None: 'None'
}

export function useVoteManager() {
    /**
     * Stores the vote state of the votes for each referendum
     */

    const refsBeingVoted = useAppStore(( state ) => state.user.voteStates )
    const clearVoteState = useAppStore((state)=> state.clearVoteState )
    const updateVoteState = useAppStore((state) => state.updateVoteState)
    const removeVoteState = useAppStore((state) => state.removeVoteState)
    const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
    const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  
    const wallet = getWalletBySource(connectedAccount?.source)


    useEffect(() => {
        clearVoteState()
    }, [])

    const voteOnRef = async ( refId, aye, balance, conviction ) => {
        await wallet.enable('Proof of Chaos')
        const api = await getApi()

        const voteExtrinsic = getVoteTx(
            api,
            aye,
            refId,
            balance * 1000000000000,
            conviction,
            true, //gov2
        )

        const vote = {
            aye,
            balance: balance,
            conviction,
            state: VoteState.AwaitingSignature
        }
        
        updateVoteState( refId, vote )
        const toastId = toast.loading(
            `(1/3) Awaiting your signature`, {
                title: `Vote on Referendum ${ refId }`,
                className: 'toaster'
            }
        )

        voteExtrinsic.signAndSend(connectedAccount.address, { signer: wallet.signer }, ({ status }) => {
            if (status.isReady) {
                updateVoteState( refId, { ...vote, state: VoteState.Ready } )
                toast.loading(`(2/3) Waiting for transaction to enter block`, {
                    id: toastId,
                });
            }
            else if (status.isInBlock) {
                console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                updateVoteState( refId, { ...vote, state: VoteState.InBlock } )
                toast.loading(`(3/3) Waiting for block finalization`, {
                    id: toastId,
                });    
            } else if (status.isFinalized) {
                console.log(`Current status: ${status.type}`);
                toast.success('Vote successfully recorded 🗳️', {
                    id: toastId,
                });
                removeVoteState( refId )
            } else {
                console.log(`Current status: ${status.type}`);
            }
        }).catch((error) => {
            console.log(':( transaction failed', error);
            removeVoteState( refId )
            toast.dismiss(toastId);
        });
    }

    return { refsBeingVoted, voteOnRef }
}