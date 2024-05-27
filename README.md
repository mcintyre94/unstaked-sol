# Unstaked SOL

Unstaked SOL is a proof of concept app to identify the accounts where a user has the most unstaked SOL. It's built for [Orbit](https://github.com/mcintyre94/orbit), but works with any Solana wallet-standard wallet.

![Demo Screenshot](./readme-images/demo-screenshot.png)

# Features

- A custom wallet connect UI built using the `@wallet-standard/react` hooks
- Support for connecting multiple accounts from a wallet
- Uses account labels from a wallet, in addition to addresses
- Fetch and display the balance for all selected accounts

# Development

This app is built using:

- [Solana Web3js TP3](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library)
- [Wallet Standard](https://github.com/wallet-standard/wallet-standard)
- [Vite](https://vite.dev)
- [React Router](https://reactrouter.com)

To run it locally use `npm run dev`

To build for production use `npm run build`
