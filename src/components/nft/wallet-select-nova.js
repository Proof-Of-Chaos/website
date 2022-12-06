

import {
  InjectedExtension,
  InjectedAccount,
  InjectedWindow,
} from '@polkadot/extension-inject/types';

import {
  BaseDotsamaWallet,
} from "@talismn/connect-wallets"

import logo from '../../../public/logos/nova.svg'
export class NovaWallet extends BaseDotsamaWallet {
  extensionName = 'polkadot-js';
  title = 'Nova Wallet';
  installUrl =
    'https://novawallet.io/';
  noExtensionMessage =
    'You can use any Polkadot compatible wallet but we recommend using Nova Wallet';
  logo = {
    src: logo.src,
    alt: 'Nova Wallet Logo',
  };

  get installed() {
    return window.walletExtension?.isNovaWallet
  }
}