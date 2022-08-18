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


export default function WalletConnect (props) {
  const { openModal } = useModal();
  // const [ connectedWallet, setSelectedWallet ] = useState(null)
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)
  const updateConnectedWallet = useAppStore( ( state ) => state.updateConnectedWallet );

  return(
    <>
      <WalletSelect
        dappName="Proof of Chaos Governance"
        open={false}
        onAccountSelected={(account) => {
          updateConnectedWallet( {
            ...account,
            ksmAddress: encodeAddress( account?.address, 2 )
          } )
        }}

        triggerComponent={
          <Button
            className={ `wallet-connect flex shadow-main hover:shadow-large ${props.className}` }
            variant="calm"
          >
            { connectedWallet ?
              <>
                <div className="identicon-wrap">
                  <Identicon
                    size={32}
                    id={connectedWallet.address}
                    schema="polkadot"
                  />
                </div>
                <span className="pl-3">{ connectedWallet.name }</span>
              </>
              :
              <>
                <FontAwesomeIcon className="pl-1" icon={ faWallet }/>
                <span className="pl-3">Connect</span>
              </>
            }
          </Button>
        }

        showAccountsList={true}
      />
    </>
  )
}