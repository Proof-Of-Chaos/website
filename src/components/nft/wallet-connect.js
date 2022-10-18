import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"
import { useEffect, useState } from 'react'
import useAppStore from "../../zustand"
import Identicon from "../ui/identicon"
import classNames from "classnames"
import { WalletSelect } from '@talisman-connect/components';
import { encodeAddress } from '@polkadot/keyring'
import { useIsMounted } from "../../hooks/use-is-mounted"
import { useQueryClient } from "@tanstack/react-query"


export default function WalletConnect ( { className, title, onAccountSelected, variant = 'calm' } ) {
  const { openModal } = useModal();
  const isMounted = useIsMounted();
  // const [ connectedAccounts, setSelectedWallet ] = useState(null)
  const connectedAccounts = useAppStore((state) => state.user.connectedAccounts )
  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const updateConnectedAccounts = useAppStore( ( state ) => state.updateConnectedAccounts );
  const updateConnectedAccount = useAppStore( ( state ) => state.updateConnectedAccount );

  const queryClient = useQueryClient()

  return(
    isMounted && <>
      <WalletSelect
        dappName="Proof of Chaos Governance"
        open={false}

        onWalletSelected={(accounts) => {
          updateConnectedAccounts( {
            ...accounts,
          } )
        }}

        onUpdatedAccounts={( accounts ) => {
          const transformedAccounts = accounts.map( acc => {
            return {
              ...acc,
              ksmAddress: encodeAddress( acc?.address, 2 ),
            }
          })
          updateConnectedAccounts( transformedAccounts )
        }}

        onAccountSelected={ (newAccount) => {
          queryClient.invalidateQueries(['distributions'])
          queryClient.invalidateQueries(['votes'])
          console.log( 'new account selected', newAccount)
          if ( connectedAccounts?.length ) {
            const connectedAccountIndex = connectedAccounts.findIndex( acc => acc.address === newAccount.address )
            updateConnectedAccount( connectedAccountIndex )
          }
        }}

        triggerComponent={
          <Button
            className={ `wallet-connect flex shadow-main hover:shadow-large ${className}` }
            variant={ variant }
          >
            { connectedAccount ?
              <>
                <div className="identicon-wrap hidden sm:block">
                  <Identicon
                    size={32}
                    id={connectedAccount.address}
                    schema="polkadot"
                  />
                </div>
                <span className="pl-0 sm:pl-3">{ connectedAccount.name }</span>
              </>
              :
              <>
                { title ? title :
                <>
                  <FontAwesomeIcon className="pl-1" icon={ faWallet }/>
                  <span className="pl-3">Connect</span>
                </>
                }
              </>
            }
          </Button>
        }

        showAccountsList={true}
      />
    </>
  )
}