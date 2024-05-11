import { Wallet } from "@wallet-standard/base";
import { WalletProvider, WalletAccountProvider, ConnectProvider, DisconnectProvider, useWallets, WalletsProvider, useConnect, useWallet } from "@wallet-standard/react-core";
import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";

function onError(error: Error) {
    console.error(error);
}

function Inner() {
    const wallets = useWallets();
    console.log({ wallets })

    const wallet = useWallet();
    wallet.setWallet(wallets.wallets[0])
    console.log({ wallet });

    const { waiting, connect } = useConnect()
    console.log({ connect });

    return (
        <div>
            <button onMouseDown={() => connect ? connect({ silent: false }) : {}}>
                {waiting ? "Loading..." : "Connecty!"}
            </button>

            <div style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(wallet.accounts.map(w => ({ ...w, publicKey: undefined })), null, 2)}
            </div>
        </div>
    )
}

export function loader(
    wallets: ReturnType<typeof useWallets>['wallets']
) {
    const storedWalletName = localStorage.getItem('walletName');
    let selectedWallet: Wallet | null = null;
    if (storedWalletName) {
        const wallet = wallets.find(w => w.name === storedWalletName);
        if (wallet) {
            selectedWallet = wallet;
        }
    }

    return {
        selectedWallet,
    }
}

export default function Root() {
    const { selectedWallet } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const { setWallet } = useWallet();

    // Need to do this in a useEffect because it updates state on a parent component
    useEffect(() => {
        if (selectedWallet) {
            setWallet(selectedWallet);
        }
    }, [selectedWallet]);

    return (
        <p>{JSON.stringify(selectedWallet?.accounts.map(a => a.address))}</p>
    )
}