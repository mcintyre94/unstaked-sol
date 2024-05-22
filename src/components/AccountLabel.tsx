import { Text, TextProps, Tooltip, CopyButton, ActionIcon, rem, Group } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { WalletAccount } from "@wallet-standard/base";

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

export function AccountLabel({ account }: { account: WalletAccount }) {
    const hasLabel = (account.label?.length ?? 0) > 0;

    if (hasLabel) {
        return (
            <Group gap='lg'>
                <Text size="lg">{account.label}</Text>
                <Group gap={2}>
                    <Text c="gray.6">({<ShortAddress address={account.address} span size="md" c="gray.6" />})</Text>
                    <AddressCopyButton address={account.address} />
                </Group>
            </Group>
        )
    } else {
        return (
            <Group gap={2}>
                <ShortAddress address={account.address} size="lg" />
                <AddressCopyButton address={account.address} />
            </Group>
        )
    }
}