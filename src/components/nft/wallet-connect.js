import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"
import { useEffect, useState } from 'react'
import useAppStore from "../../zustand"

export default function WalletConnect (props) {
  const { openModal } = useModal();
  const [ selectedWallet, setSelectedWallet ] = useState(null)
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)

  useEffect(() => {
    setSelectedWallet( connectedWallet )
  }, [ connectedWallet ])

  return(
    <Button
      onClick={() => openModal('VIEW_CONNECT_WALLET')}
      className="flex justify-center shadow-main hover:shadow-large"
      variant="primary"
      { ...props }
    >
      <FontAwesomeIcon className="pl-1" icon={ faWallet }/><span className="pl-3">{ selectedWallet ? selectedWallet.name : 'Connect' } </span>
    </Button>
  )
}