import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"

export default function WalletConnect (props) {
  const { openModal } = useModal();
  return(
    <Button
      onClick={() => openModal('VIEW_CONNECT_WALLET')}
      className="shadow-main hover:shadow-large"
    >
      <FontAwesomeIcon icon={ faWallet }/><span className="pl-3">Connect</span>
    </Button>
  )
}