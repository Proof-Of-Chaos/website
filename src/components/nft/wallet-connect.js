import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"

export default function WalletConnect (props) {
  const { openModal } = useModal();
  return(
    <Button
      onClick={() => openModal('VIEW_CONNECT_WALLET')}
      className="flex justify-center shadow-main hover:shadow-large"
      variant="primary"
    >
      <FontAwesomeIcon className="pl-1" icon={ faWallet }/><span className="pl-3">Connect</span>
    </Button>
  )
}