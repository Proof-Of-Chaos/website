import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"
import { useEffect, useState } from 'react'
import useAppStore from "../../zustand"
import Identicon from "../ui/identicon"
import classNames from "classnames"


export default function WalletConnect (props) {
  const { openModal } = useModal();
  const [ selectedWallet, setSelectedWallet ] = useState(null)
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)

  useEffect(() => {
    setSelectedWallet( connectedWallet )
    console.log( 'xxx', selectedWallet )
  }, [ connectedWallet ])

  return(
    <Button
      onClick={() => openModal('VIEW_CONNECT_WALLET')}
      className={ `wallet-connect flex shadow-main hover:shadow-large ${props.className}` }
      variant="calm"
    >
      { selectedWallet ?
        <>
          <div className="identicon-wrap">
            <Identicon
              size={32}
              id={selectedWallet.address}
              schema="polkadot"
            />
          </div>
          <span className="pl-3">{ selectedWallet.name }</span>
        </>
        :
        <>
          <FontAwesomeIcon className="pl-1" icon={ faWallet }/>
          <span className="pl-3">Connect</span>
        </>
      }
    </Button>
  )
}