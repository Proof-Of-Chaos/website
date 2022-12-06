import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { WalletSelect } from '@talismn/connect-components'
import {
  PolkadotjsWallet,
  SubWallet,
  TalismanWallet
} from "@talismn/connect-wallets"
import { encodeAddress } from '@polkadot/keyring'
import { useQueryClient } from "@tanstack/react-query"

import { NovaWallet } from './wallet-select-nova'

import useAppStore from "../../zustand"
import Identicon from "../ui/IdenticonWithoutSSR"
import Button from "../ui/button"
import { useIsMounted } from "../../hooks/use-is-mounted"

export default function WalletConnect ( { className, title, onAccountSelected, variant = 'calm' } ) {
  const isMounted = useIsMounted();
  // const [ connectedAccounts, setSelectedWallet ] = useState(null)
  const connectedAccounts = useAppStore((state) => state.user.connectedAccounts )
  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const updateConnectedAccounts = useAppStore( ( state ) => state.updateConnectedAccounts );
  const updateConnectedAccount = useAppStore( ( state ) => state.updateConnectedAccount );

  const queryClient = useQueryClient()

  let walletList = [
    new TalismanWallet(),
    new SubWallet(),
    new PolkadotjsWallet(),
  ]

  if ( isMounted && window.walletExtension?.isNovaWallet ) {
    walletList = [
      new PolkadotjsWallet(),
      new SubWallet(),
      new NovaWallet(),
    ]
  }

  return(
    isMounted && <>
      <WalletSelect
        dappName="Proof of Chaos Governance"
        open={false}
        walletList={ walletList }
        showAccountsList={true}

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
          if ( connectedAccounts?.length ) {
            const connectedAccountIndex = connectedAccounts.findIndex( acc => acc.address === newAccount.address )
            updateConnectedAccount( connectedAccountIndex )
          }
        }}

        triggerComponent={
          <Button
            className={ `wallet-connect shadow-main hover:shadow-large ${className}` }
            variant={ variant }
          >
            { connectedAccount ?
              <>
                <div className="identicon-wrap h-[32px]">
                  <Identicon
                    value={ connectedAccount.address }
                    size={ 32 }
                    theme={ 'polkadot' }
                  />
                </div>
                <span className="pl-0 sm:pl-3 hidden sm:block">{ connectedAccount.name }</span>
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
      />
    </>
  )
}