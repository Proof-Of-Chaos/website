import Button from "../ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useModal } from "../modals/context"
import { useEffect, useState } from 'react'

export default function WalletConnect (props) {
  const { openModal } = useModal();
  const [ selectedAccount, setSelectedAccount ] = useState(null)

  useEffect(() => {
    let selectedAccount = JSON.parse(localStorage.getItem('selectedAccount'))
    if (selectedAccount) {
      setSelectedAccount(selectedAccount)
    }
  }, [])

  const setAccount = function(account) {
    localStorage.setItem('selectedAccount', JSON.stringify(account))
    setSelectedAccount(account)
  }

  return(
    <Button
      onClick={() => openModal('VIEW_CONNECT_WALLET', { setAccount: (account) => setAccount(account) })}
      className="flex justify-center shadow-main hover:shadow-large"
      variant="primary"
      { ...props }
    >
      <FontAwesomeIcon className="pl-1" icon={ faWallet }/><span className="pl-3">{ selectedAccount ? selectedAccount.name : 'Connect' } </span>
    </Button>
  )
}