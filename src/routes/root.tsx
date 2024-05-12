import { Wallet } from "@wallet-standard/base";
import { useWallets, useWallet } from "@wallet-standard/react-core";
import { useEffect } from "react";
import { Form, useLoaderData } from "react-router-dom";

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

export function action() {
    localStorage.setItem('walletName', 'Orbit');
    return new Response();
}

function useSyncSelectedWallet(selectedWallet: Wallet | null) {
    const { setWallet } = useWallet();

    useEffect(() => {
        if (selectedWallet) {
            setWallet(selectedWallet);
        }
    }, [selectedWallet, setWallet]);
}

export default function Root() {
    const { selectedWallet } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    useSyncSelectedWallet(selectedWallet);

    const { wallet } = useWallet();

    return (
        <div>
            <Form method='POST'>
                <button type='submit'>Set it!</button>
            </Form>


            <p>{wallet ? JSON.stringify(wallet?.accounts) : "no wallet yet!"}</p>
        </div>
    )
}
