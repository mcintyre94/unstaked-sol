import { Menu, Image, Button, CopyButton, Text } from "@mantine/core";
import { Wallet } from "@wallet-standard/base";
import { StandardConnectFeature } from "@wallet-standard/features";
import { useWallets, useWallet, hasConnectFeature, useConnect, useDisconnect } from "@wallet-standard/react-core";
import { useState, useMemo, useCallback } from "react";
import { IconChevronDown } from '@tabler/icons-react';

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
        <Menu transitionProps={{ transition: 'pop-bottom-right', duration: 200 }}>
            <Menu.Target>
                <Button miw={150} disabled={connecting} rightSection={<IconChevronDown />}>{connecting ? "Connecting..." : "Connect Wallet"}</Button>
            </Menu.Target>

            <Menu.Dropdown miw={200}>
                {connectableWallets.map(wallet =>
                    <Menu.Item onClick={() => connect(wallet)} py={8} key={wallet.name} leftSection={
                        <Image
                            h='1.8rem'
                            w='1.8rem'
                            src={wallet.icon}
                            alt={`${wallet.name} logo`}
                            mr='12px'
                        />
                    }>
                        {wallet.name}
                    </Menu.Item>
                )}
            </Menu.Dropdown>
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

    const accounts = wallet!.accounts;

    return (
        <Menu transitionProps={{ transition: 'pop-bottom-right', duration: 200 }}>
            <Menu.Target>
                <Button miw={150} disabled={disconnecting || connecting} leftSection={
                    <Image
                        h='1.8rem'
                        w='1.8rem'
                        src={wallet!.icon}
                        alt={`${wallet!.name} logo`}
                        mr='12px'
                    />
                } rightSection={<IconChevronDown />}>{accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}</Button>
            </Menu.Target>

            <Menu.Dropdown miw={200}>
                <Menu.Item>
                    <CopyButton value={accounts.map(a => a.address).join(', ')}>
                        {({ copied, copy }) => (
                            copied ? <Text>Copied</Text> : <Text onClick={copy}>Copy {accounts.length === 1 ? 'Address' : 'Addresses'}</Text>
                        )}
                    </CopyButton>
                </Menu.Item>
                <Menu.Item onClick={() => connect?.({ silent: false })}>Change Accounts</Menu.Item>
                <Menu.Item onClick={myDisconnect}>Disconnect</Menu.Item>
            </Menu.Dropdown>
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
