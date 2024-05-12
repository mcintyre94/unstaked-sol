import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root, { loader as rootLoader, action as rootAction } from './routes/root'
import { ConnectProvider, DisconnectProvider, useWallets, WalletProvider, WalletsProvider } from '@wallet-standard/react-core'

function Main() {
  const { wallets } = useWallets();

  const router = createBrowserRouter([
    {
      path: "/",
      action: rootAction,
      loader: () => rootLoader(wallets),
      element: <Root />
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletsProvider>
      <WalletProvider>
        <ConnectProvider>
          <DisconnectProvider>
            <Main />
          </DisconnectProvider>
        </ConnectProvider>
      </WalletProvider>
    </WalletsProvider>
  </React.StrictMode>,
)
