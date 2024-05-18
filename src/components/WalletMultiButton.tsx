import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, Button, MenuList, MenuItem, HStack, Image } from "@chakra-ui/react";
import { Wallet } from "@wallet-standard/base";
import { StandardConnectFeature } from "@wallet-standard/features";
import { useWallets, useWallet, hasConnectFeature, useConnect, useDisconnect } from "@wallet-standard/react-core";
import { useState, useMemo, useCallback } from "react";

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

export function WalletMultiButton() {
    const { wallet } = useWallet();

    if (wallet) {
        return <WalletMultiButtonConnected />
    }

    return (
        <WalletMultiButtonNotConnected />
    )
}
