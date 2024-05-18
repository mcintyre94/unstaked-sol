import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { ConnectProvider, DisconnectProvider, WalletProvider, WalletsProvider } from '@wallet-standard/react-core'
import { ChakraProvider, extendTheme, ThemeConfig } from '@chakra-ui/react'

function Main() {
  const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false
  }
  const theme = extendTheme({ config })


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />
    },
  ])

  return (
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
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
