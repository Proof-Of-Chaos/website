import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import { getWallets } from '@talisman-connect/wallets';
import { useModal } from "./context";
import { useEffect, useState } from 'react'

export default function SelectWalletModal( { setAccount } ) {
  const [ wallet, setWallet ] = useState(null)
  const [ accounts, setAccounts ] = useState([])

  const { closeModal } = useModal();
  const supportedWallets = getWallets();
  const polkadotJs = supportedWallets.find(result => result.extensionName === 'polkadot-js')
  const talisman = supportedWallets.find(result => result.extensionName === 'talisman')

  useEffect(() => {
    let connectedWallet = localStorage.getItem('connectedWallet')
    if (connectedWallet) {
      let useWallet = supportedWallets.find(foundWallet => foundWallet.extensionName === connectedWallet)
      if (useWallet) {
        selectWallet(useWallet)
      }
    }
  }, [])

  const selectWallet = function(wallet) {
    wallet.enable('ProofOfChaos').then(() => {
      try {
        localStorage.setItem('connectedWallet', wallet.extensionName)
        setWallet(wallet)

        wallet.subscribeAccounts((accounts) => {
          setAccounts(accounts)
        });
      } catch (err) {
        console.log("Wallet connect error: ", err)
      }
    });
  }

  const selectAccount = function(account) {
    setAccount(account)
    closeModal()
  }

  return(
      <>
        { wallet &&
          <>
            { accounts.map( ( account, index) => {
              return (
                  <li className="list-none cursor-pointer"
                      key={index}
                      onClick={() => selectAccount(account)}
                  >
                    <a className="block mx-4 text-lg font-medium transition first:ml-0 last:mr-0 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-black">
                      { account.name }
                    </a>
                  </li>
              )
            })
            }
          </>
        }
        { !wallet &&
        <>
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Select Wallet
          </Dialog.Title>
          <div className="mt-2">
            <ul>
              {polkadotJs &&
                <li className="py-2">
                  <Button
                      onClick={() => selectWallet(polkadotJs)}
                      className="flex h-16 justify-between w-full bg-gradient-to-r from-[#ff8c00]/60 to-[#ff8c00]/70 hover:bg-orange-200">
                    {polkadotJs.title}
                    <svg height="32" width="32" x="0px" y="0px" viewBox="15 15 140 140">
                      <g>
                        <circle className="bg0" fill="#FF8C00" cx="85" cy="85" r="70"></circle>
                      </g>
                      <g>
                        <path className="st0"
                              d="M85,34.7c-20.8,0-37.8,16.9-37.8,37.8c0,4.2,0.7,8.3,2,12.3c0.9,2.7,3.9,4.2,6.7,3.3c2.7-0.9,4.2-3.9,3.3-6.7 c-1.1-3.1-1.6-6.4-1.5-9.7C58.1,57.6,69.5,46,83.6,45.3c15.7-0.8,28.7,11.7,28.7,27.2c0,14.5-11.4,26.4-25.7,27.2 c0,0-5.3,0.3-7.9,0.7c-1.3,0.2-2.3,0.4-3,0.5c-0.3,0.1-0.6-0.2-0.5-0.5l0.9-4.4L81,73.4c0.6-2.8-1.2-5.6-4-6.2 c-2.8-0.6-5.6,1.2-6.2,4c0,0-11.8,55-11.9,55.6c-0.6,2.8,1.2,5.6,4,6.2c2.8,0.6,5.6-1.2,6.2-4c0.1-0.6,1.7-7.9,1.7-7.9 c1.2-5.6,5.8-9.7,11.2-10.4c1.2-0.2,5.9-0.5,5.9-0.5c19.5-1.5,34.9-17.8,34.9-37.7C122.8,51.6,105.8,34.7,85,34.7z M87.7,121.7 c-3.4-0.7-6.8,1.4-7.5,4.9c-0.7,3.4,1.4,6.8,4.9,7.5c3.4,0.7,6.8-1.4,7.5-4.9C93.3,125.7,91.2,122.4,87.7,121.7z"></path>
                      </g>
                    </svg>
                  </Button>
                </li>
              }
              { talisman &&
                <li className="py-2">
                  <Button
                      onClick={() => selectWallet(talisman)}
                      className="w-full h-16 flex justify-between bg-gradient-to-r from-[#ef6dd3]/60 to-[#6252b8]/80 hover:bg-indigo-200">
                      {talisman.title}
                    <svg fill="none" height="32" width="32" viewBox="0 0 68 64"><path clipRule="evenodd" d="m50.1164 35.6633c.6081 1.3242 2.3987 1.792 3.4291.7616l1.8899-1.89c1.9526-1.9526 5.1184-1.9526 7.0711 0 1.9526 1.9527 1.9526 5.1185 0 7.0711l-15.2728 15.2727c-3.6687 4.3546-9.1623 7.1213-15.3021 7.1213-6.4024 0-12.1021-3.0084-15.7627-7.6886l-14.70448-14.7045c-1.952616-1.9526-1.952609-5.1184 0-7.071 1.95261-1.9526 5.11842-1.9526 7.07103 0l1.86065 1.8606c1.0082 1.0083 2.7586.5547 3.3541-.7408.1177-.256.1817-.5307.1817-.8124v-22.8434c0-2.76142 2.2386-4.99998 5-4.99999 2.7614 0 4.9999 2.23856 4.9999 4.99999v11.5569c0 .9942 1.0185 1.669 1.9664 1.3695.6-.1896 1.0335-.7359 1.0335-1.3651v-18.56121c0-2.76141 2.2385-4.99997881 4.9999-4.99997953 2.7614-.00000073 5 2.23855953 5 4.99996953v18.56122c0 .6292.4335 1.1755 1.0334 1.3651.948.2996 1.9664-.3752 1.9664-1.3694v-11.557c0-2.76142 2.2386-4.99999 5-4.99999s5 2.23856 5 4.99999v22.8353c0 .2872.0652.5671.185.8281z" fill="#005773" fillRule="evenodd"/><path d="m47.9326 45.9998s-7.1634 9.9999-16 9.9999c-8.8365 0-15.9999-9.9999-15.9999-9.9999s7.1634-10 15.9999-10c8.8366 0 16 10 16 10z" fill="#fd8fff"/><g strokeWidth="1.00266"><path d="m39.4309 45.9997c0 4.1414-3.3573 7.4987-7.4987 7.4987-4.1413 0-7.4986-3.3573-7.4986-7.4987 0-4.1413 3.3573-7.4986 7.4986-7.4986 4.1414 0 7.4987 3.3573 7.4987 7.4986z" stroke="#005773"/><path d="m36.4307 45.9998c0 2.4846-2.0141 4.4987-4.4987 4.4987-2.4845 0-4.4986-2.0141-4.4986-4.4987 0-2.4845 2.0141-4.4986 4.4986-4.4986 2.4846 0 4.4987 2.0141 4.4987 4.4986z" stroke="#005773"/><path d="m42.4311 45.9997c0 5.7982-4.7004 10.4986-10.4986 10.4986s-10.4986-4.7004-10.4986-10.4986 4.7004-10.4986 10.4986-10.4986 10.4986 4.7004 10.4986 10.4986z" stroke="#005773"/><path d="m45.4309 45.9996c0 7.4551-6.0435 13.4986-13.4986 13.4986s-13.4986-6.0435-13.4986-13.4986 6.0435-13.4986 13.4986-13.4986 13.4986 6.0435 13.4986 13.4986z" stroke="#005773"/><path d="m33.4311 45.9996c0 .8277-.671 1.4987-1.4987 1.4987s-1.4987-.671-1.4987-1.4987.671-1.4987 1.4987-1.4987 1.4987.671 1.4987 1.4987z" fill="#09ffc4" stroke="#005773"/><path d="m33.4311 45.9996c0 .8277-.671 1.4987-1.4987 1.4987s-1.4987-.671-1.4987-1.4987.671-1.4987 1.4987-1.4987 1.4987.671 1.4987 1.4987z" fill="#09ffc4" stroke="#005773"/><path d="m16.6532 46.1213c-.0341-.0437-.0654-.0843-.094-.1215.0286-.0373.0599-.0779.094-.1215.2085-.2676.5176-.6517.9163-1.1133.798-.9241 1.9524-2.1556 3.3771-3.3857 2.865-2.4738 6.7493-4.8782 10.986-4.8782s8.121 2.4044 10.9861 4.8781c1.4247 1.2302 2.579 2.4617 3.3771 3.3857.3987.4617.7077.8458.9163 1.1134.034.0436.0654.0842.094.1215-.0286.0372-.06.0778-.094.1214-.2086.2676-.5176.6517-.9163 1.1134-.7981.9241-1.9524 2.1555-3.3771 3.3857-2.8651 2.4737-6.7494 4.8781-10.9861 4.8781s-8.121-2.4044-10.986-4.8781c-1.4247-1.2302-2.5791-2.4616-3.3771-3.3857-.3987-.4617-.7078-.8458-.9163-1.1133z" stroke="#fd8fff"/></g></svg>
                  </Button>
                </li>
              }
            </ul>
          </div>

          <div className="mt-4">
            <Button
                variant="calm"
                onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </>
        }
      </>
  )
}