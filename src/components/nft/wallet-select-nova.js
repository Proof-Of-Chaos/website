

import logo from '../../../public/logos/nova.svg'

export class NovaWallet {
  extensionName = 'nova wallet';
  title = 'Nova Wallet';
  installUrl =
    'https://play.google.com/store/apps/details?id=net.novawallet.android&hl=de&gl=US';
  noExtensionMessage =
    'You can use any Polkadot compatible wallet but we recommend using Talisman';
  logo = {
    src: logo.src,
    alt: 'Nova Wallet Logo',
  };
}