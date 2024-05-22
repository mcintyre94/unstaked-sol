import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root, { action as rootAction } from './routes/root'
import { ConnectProvider, DisconnectProvider, WalletProvider, WalletsProvider } from '@wallet-standard/react-core'

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    action: rootAction,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletsProvider>
      <WalletProvider>
        <ConnectProvider>
          <DisconnectProvider>
            <MantineProvider defaultColorScheme='dark'>
              <RouterProvider router={router} />
            </MantineProvider>
          </DisconnectProvider>
        </ConnectProvider>
      </WalletProvider>
    </WalletsProvider>
  </React.StrictMode>,
)
