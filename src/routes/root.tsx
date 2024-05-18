import { useWallet } from "@wallet-standard/react-core";
import { useMemo } from "react";
import { useWalletLocalStorage } from "../hooks/useWalletLocalStorage";
import { WalletMultiButton } from "../components/WalletMultiButton";
import { Checkbox, Container, Flex, Text } from "@mantine/core";

export default function Root() {
    const { isLoadingStoredWallet } = useWalletLocalStorage();

    const { wallet } = useWallet();
    const accounts = useMemo(() => wallet?.accounts ?? [], [wallet?.accounts]);

    if (isLoadingStoredWallet) return null;

    return (
        <Container m={32}>
            <Flex direction='column' align='center' gap='xl'>
                <WalletMultiButton />

                <Container>
                    {accounts.length > 0 ?
                        accounts.map(account => (
                            <Checkbox key={account.address} defaultChecked={true} size='md' label={`${account.label} (${account.address})`} />
                        )) :
                        <Text> Connect a wallet to get started...</Text>
                    }
                </Container>
            </Flex >
        </Container >
    )
}
