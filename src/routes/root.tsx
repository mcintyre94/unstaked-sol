import { Checkbox, Container, VStack } from "@chakra-ui/react";
import { useWallet } from "@wallet-standard/react-core";
import { useMemo } from "react";
import { useWalletLocalStorage } from "../hooks/useWalletLocalStorage";
import { WalletMultiButton } from "../components/WalletMultiButton";

export default function Root() {
    const { isLoadingStoredWallet } = useWalletLocalStorage();

    const { wallet } = useWallet();
    const accounts = useMemo(() => wallet?.accounts ?? [], [wallet?.accounts]);

    if (isLoadingStoredWallet) return null;

    return (
        <Container margin={8}>
            <VStack>
                <WalletMultiButton />

                <div>
                    {accounts.length > 0 ? accounts.map(account => (
                        <Checkbox key={account.address} defaultChecked={true}>{account.label} ({account.address})</Checkbox>
                    )) : <span>Connect a wallet to get started...</span>}
                </div>
            </VStack>
        </Container>
    )
}
