import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Checkbox, Container, HStack, Image, Input, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react";
import { Wallet } from "@wallet-standard/base";
import { StandardConnectFeature } from "@wallet-standard/features";
import { useWallets, useWallet, useConnect, hasConnectFeature, useDisconnect } from "@wallet-standard/react-core";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import useAsyncEffect from "use-async-effect";

const WALLET_NAME_KEY = 'walletName'

export function loader() {
    return {
        storedWalletName: localStorage.getItem(WALLET_NAME_KEY)
    }
}

// connect to the wallet stored in localstorage
function useLoadStoredWallet(storedWalletName: string | null) {
    const { wallets } = useWallets();
    const { setWallet } = useWallet();

    const selectedWallet = useMemo(() => {
        if (storedWalletName) {
            return wallets.find(wallet => wallet.name === storedWalletName);
        } else {
            return undefined
        }
    }, [wallets, storedWalletName]);

    useAsyncEffect(async (isMounted) => {
        if (!isMounted()) return;
        if (selectedWallet) {
            // workaround for wallets not exposing authorised accounts until you call connect again
            if (hasConnectFeature(selectedWallet.features)) {
                await selectedWallet.features['standard:connect'].connect({ silent: true });
            }
            setWallet(selectedWallet);
        }
    }, [selectedWallet, setWallet]);
}

// when wallet changes, sync it to localstorage
function useStoreSelectedWallet() {
    const { wallet } = useWallet();

    useEffect(() => {
        console.log('useStoreSelectedWallet called because wallet changed!');
        if (wallet) {
            localStorage.setItem(WALLET_NAME_KEY, wallet.name);
        } else {
            localStorage.removeItem(WALLET_NAME_KEY);
        }
    }, [wallet]);
}

function WalletMultiButtonNotConnected() {
    const { wallets } = useWallets();
    const { setWallet } = useWallet();
    const [connecting, setConnecting] = useState(false);

    const connectableWallets = useMemo(() => wallets.filter(wallet => hasConnectFeature(wallet.features)), [wallets]);

    const connect = useCallback(async (wallet: Wallet) => {
        setConnecting(true);
        try {
            await (wallet.features as StandardConnectFeature)['standard:connect'].connect({ silent: false });
            setWallet(wallet);
        } finally {
            setConnecting(false);
        }
    }, [setWallet])

    return (
        <Menu>
            <MenuButton isDisabled={connecting} as={Button} rightIcon={<ChevronDownIcon />}>
                {connecting ? "Connecting..." : "Connect Wallet"}
            </MenuButton>
            <MenuList>
                {connectableWallets.map(wallet => (
                    <MenuItem key={wallet.name} value={wallet.name} onClick={() => connect(wallet)}>
                        <Image
                            boxSize='2rem'
                            src={wallet.icon}
                            alt={`${wallet.name} logo`}
                            mr='12px'
                        />
                        <span>{wallet.name}</span>
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    )
}

function WalletMultiButtonConnected() {
    const { wallet, setWallet } = useWallet();
    const { connect, waiting: connecting } = useConnect();
    const { disconnect } = useDisconnect();
    const [disconnecting, setDisconnecting] = useState(false);

    const myDisconnect = useCallback(async () => {
        setDisconnecting(true)
        try {
            if (disconnect) {
                await disconnect()
            }
        } finally {
            setWallet(null);
            setDisconnecting(false)
        }
    }, [disconnect, setWallet])

    return (
        <Menu>
            <MenuButton isDisabled={disconnecting || connecting} as={Button} rightIcon={<ChevronDownIcon />}>
                <HStack>
                    <Image
                        boxSize='2rem'
                        src={wallet!.icon}
                        alt={`${wallet!.name} logo`}
                        mr='12px'
                    />
                    <span>{wallet!.accounts.length} accounts</span>
                </HStack>
            </MenuButton>
            <MenuList>
                <MenuItem onClick={() => connect?.({ silent: false })}>Change Accounts</MenuItem>
                <MenuItem onClick={myDisconnect}>Disconnect</MenuItem>
            </MenuList>
        </Menu>
    )
}

function WalletMultiButton() {
    const { wallet } = useWallet();

    if (wallet) {
        return <WalletMultiButtonConnected />
    }

    return (
        <WalletMultiButtonNotConnected />
    )
}

export default function Root() {
    const { storedWalletName } = useLoaderData() as ReturnType<typeof loader>;
    useLoadStoredWallet(storedWalletName);
    useStoreSelectedWallet();

    const { wallet } = useWallet();
    const accounts = useMemo(() => wallet?.accounts ?? [], [wallet?.accounts]);

    console.log({ wallet, accounts })

    return (
        <Container margin={8}>
            <VStack>
                <WalletMultiButton />

                <Text>
                    {accounts.length > 0 ? accounts.map(account => (
                        <Checkbox defaultChecked={true}>{account.label} ({account.address})</Checkbox>
                    )) : <p>Connect a wallet to get started...</p>}
                </Text>
            </VStack>
        </Container>
    )
}
