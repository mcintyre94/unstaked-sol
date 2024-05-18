import { useWallets, useWallet, hasConnectFeature } from "@wallet-standard/react-core";
import { useState, useMemo, useEffect } from "react";
import useAsyncEffect from "use-async-effect";

// connect to the wallet stored in localstorage
function useLoadStoredWallet(walletNameLocalStorageKey: string) {
    const { wallets } = useWallets();
    const { setWallet } = useWallet();
    const [isLoadingStoredWallet, setIsLoadingStoredWallet] = useState(true);

    const storedWalletName = useMemo(() => localStorage.getItem(walletNameLocalStorageKey), [walletNameLocalStorageKey]);

    const selectedWallet = useMemo(() => {
        if (storedWalletName) {
            return wallets.find(wallet => wallet.name === storedWalletName);
        } else {
            return undefined
        }
    }, [wallets, storedWalletName]);

    useAsyncEffect(async (isMounted) => {
        if (!isMounted()) return;
        try {
            if (selectedWallet) {
                // workaround for wallets not exposing authorised accounts until you call connect again
                if (hasConnectFeature(selectedWallet.features)) {
                    await selectedWallet.features['standard:connect'].connect({ silent: true });
                }
                setWallet(selectedWallet);
            }
        } finally {
            setIsLoadingStoredWallet(false)
        }
    }, [selectedWallet, setWallet]);

    return { isLoadingStoredWallet }
}

// when wallet changes, sync it to localstorage
function useStoreSelectedWallet(walletNameLocalStorageKey: string) {
    const { wallet } = useWallet();

    useEffect(() => {
        if (wallet) {
            localStorage.setItem(walletNameLocalStorageKey, wallet.name);
        } else {
            localStorage.removeItem(walletNameLocalStorageKey);
        }
    }, [walletNameLocalStorageKey, wallet]);
}

type UseWalletLocalStorageProps = {
    walletNameLocalStorageKey?: string;
}

export function useWalletLocalStorage(props?: UseWalletLocalStorageProps) {
    const walletNameLocalStorageKey = props?.walletNameLocalStorageKey ?? 'walletName';

    const { isLoadingStoredWallet } = useLoadStoredWallet(walletNameLocalStorageKey);
    useStoreSelectedWallet(walletNameLocalStorageKey);

    return { isLoadingStoredWallet }
}