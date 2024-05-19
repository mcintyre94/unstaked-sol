import { useWallet } from "@wallet-standard/react-core";
import { useMemo } from "react";
import { useWalletLocalStorage } from "../hooks/useWalletLocalStorage";
import { WalletMultiButton } from "../components/WalletMultiButton";
import { ActionIcon, Checkbox, Container, CopyButton, Flex, Group, Text, TextProps, Tooltip, rem } from "@mantine/core";
import { WalletAccount } from "@wallet-standard/base";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";

function shortAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

interface ShortAddressProps extends TextProps {
    address: string
}

function ShortAddress({ address, ...textProps }: ShortAddressProps) {
    return (
        <Tooltip label={address}>
            <Text {...textProps}>{shortAddress(address)}</Text>
        </Tooltip>
    )
}

function AddressCopyButton({ address }: { address: string }) {
    return (
        <CopyButton value={address} timeout={500}>
            {({ copied, copy }) => (
                <>
                    {copied ? (
                        <Text size="md">Copied</Text>
                    ) : (
                        <ActionIcon variant='subtle' color='gray.9'>
                            <IconCopy style={{ width: rem(16) }} onClick={(event) => {
                                // prevent modifying the checkbox
                                event.preventDefault();
                                copy()
                            }} />
                        </ActionIcon>
                    )}
                </>
            )}
        </CopyButton>
    );
}

function AccountLabel({ account }: { account: WalletAccount }) {
    const hasLabel = (account.label?.length ?? 0) > 0;

    if (hasLabel) {
        return (
            <Group gap='lg'>
                <Text size="lg">{account.label}</Text>
                <Group gap='xs'>
                    <Text c="gray.6">({<ShortAddress address={account.address} span size="md" c="gray.6" />})</Text>
                    <AddressCopyButton address={account.address} />
                </Group>
            </Group>
        )
    } else {
        return (
            <Group gap='xs'>
                <ShortAddress address={account.address} size="lg" />
                <AddressCopyButton address={account.address} />
            </Group>
        )
    }
}

export default function Root() {
    const { isLoadingStoredWallet } = useWalletLocalStorage();

    const { wallet } = useWallet();
    const accounts = useMemo(() => wallet?.accounts ?? [], [wallet?.accounts]);

    if (isLoadingStoredWallet) return null;

    return (
        <Container m={32}>
            <Flex direction='column' align='center' gap='xl'>
                <WalletMultiButton />

                <Container miw='100%'>
                    {accounts.length > 0 ?
                        accounts.map(account => (
                            <Checkbox key={account.address} defaultChecked={true} size='md' label={<AccountLabel account={account} />} />
                        )) :
                        <Text> Connect a wallet to get started...</Text>
                    }
                </Container>
            </Flex >
        </Container >
    )
}
