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


export default function WalletConnect ( { className, title, onAccountSelected, variant = 'calm' } ) {
  const { openModal } = useModal();
  // const [ connectedWallet, setSelectedWallet ] = useState(null)
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)
  const connectedAccount = useAppStore((state) => state.user.connectedAccount)
  const updateConnectedWallet = useAppStore( ( state ) => state.updateConnectedWallet );
  const updateConnectedAccount = useAppStore( ( state ) => state.updateConnectedAccount );

  return(
    <>
      <WalletSelect
        dappName="Proof of Chaos Governance"
        open={false}

        onWalletSelected={(wallet) => {
          updateConnectedWallet( {
            ...wallet,
          } )
        }}

        onUpdatedAccounts={(accounts) => {
          updateConnectedWallet( {
            ...connectedWallet,
            accounts,
          } )
        }}

        onAccountSelected={ (account) => {
          typeof onAccountSelected === 'function' ? onAccountSelected() : () => {}
          updateConnectedAccount( {
            ...account,
            ksmAddress: encodeAddress( account?.address, 2 )
          } )
        }}

        triggerComponent={
          <Button
            className={ `wallet-connect flex shadow-main hover:shadow-large ${className}` }
            variant={ variant }
          >
            { connectedAccount ?
              <>
                <div className="identicon-wrap">
                  <Identicon
                    size={32}
                    id={connectedAccount.address}
                    schema="polkadot"
                  />
                </div>
                <span className="pl-3">{ connectedAccount.name }</span>
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