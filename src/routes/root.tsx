import { useWallet } from "@wallet-standard/react-core";
import { useMemo } from "react";
import { useWalletLocalStorage } from "../hooks/useWalletLocalStorage";
import { WalletMultiButton } from "../components/WalletMultiButton";
import { Button, Checkbox, Container, Flex, SimpleGrid, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput } from "@mantine/core";
import { AccountLabel } from "../components/AccountLabel";
import { ActionFunctionArgs, Form, useActionData, useNavigation } from "react-router-dom";
import { Address, LamportsUnsafeBeyond2Pow53Minus1, createSolanaRpc, isAddress, mainnet } from "@solana/web3.js";
import { displayLamportsAsSol } from "../utils/lamports";

type AddressWithBalance = {
    address: Address,
    balanceLamports: LamportsUnsafeBeyond2Pow53Minus1
};

type ActionResponse = {
    kind: 'error',
    error: string
} | {
    kind: 'success',
    data: AddressWithBalance[]
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    const formData = await request.formData();
    const rpcAddress = formData.get('rpc');
    if (!rpcAddress) {
        return {
            kind: 'error',
            error: 'No RPC address'
        }
    }
    const rpc = createSolanaRpc(mainnet(rpcAddress.toString()));
    const addresses = formData.getAll('addresses').map(a => a.toString()).filter(a => isAddress(a)) as Address[];
    if (addresses.length === 0) {
        return {
            kind: 'error',
            error: 'No accounts provided'
        }
    }

    const data: AddressWithBalance[] = []
    // one at a time to avoid rate limits
    for (const address of addresses) {
        const { value } = await rpc.getBalance(address).send({ abortSignal: request.signal })
        data.push({ address, balanceLamports: value })
    }

    return {
        kind: 'success',
        data,
    }
}


export default function Root() {
    const { isLoadingStoredWallet } = useWalletLocalStorage();
    const actionData = useActionData() as Awaited<ReturnType<typeof action>>;

    const { wallet } = useWallet();
    const accounts = useMemo(() => wallet?.accounts ?? [], [wallet?.accounts]);
    const addressLabels = useMemo(() =>
        Object.fromEntries(accounts.map(a => ([a.address, a.label]))), [accounts]
    )
    const hasLabels = useMemo(() => Object.values(addressLabels).filter(l => l !== undefined).length > 0, [addressLabels]);

    const navigation = useNavigation();
    const pendingAddresses = useMemo(() => {
        return navigation.formData?.getAll('addresses')
    }, [navigation.formData])

    const fetchedData = useMemo(() => {
        return actionData?.kind === 'success' ? actionData.data : []
    }, [actionData]);

    if (isLoadingStoredWallet) return null;

    return (
        <Container size='lg' mt={32}>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>

                <Flex direction='column' gap='lg' align='flex-start' style={{ width: '100%' }}>
                    <WalletMultiButton />

                    <Form method="POST">

                        <Flex direction='column' gap='lg' align='flex-start'>
                            <TextInput w='100%' required label="RPC Address" placeholder="https://mainnet.helius-rpc.com?api-key=" name='rpc' />

                            <Stack gap={2}>
                                {accounts.length > 0 ?
                                    accounts.map(account => (
                                        <Checkbox key={account.address} name='addresses' value={account.address} defaultChecked={true} size='md' label={<AccountLabel account={account} />} />
                                    )) :
                                    <Text> Connect a wallet to get started...</Text>
                                }
                            </Stack>

                            <Button type="submit" fit-content="true">
                                Fetch
                            </Button>
                        </Flex>
                    </Form>
                </Flex>

                <Table striped withRowBorders withTableBorder>
                    <TableThead>
                        <TableTr>
                            <TableTh>{hasLabels ? "Label" : "Address"}</TableTh>
                            <TableTh>Unstaked SOL</TableTh>
                        </TableTr>
                    </TableThead>
                    <TableTbody>
                        {pendingAddresses?.map(address => (
                            <TableTr>
                                <TableTd>{addressLabels[address.toString()] ?? address.toString()}</TableTd>
                                <TableTd>Loading...</TableTd>
                            </TableTr>
                        ))}
                        {!pendingAddresses && fetchedData.map(({ address, balanceLamports }) => (
                            <TableTr>
                                <TableTd>{addressLabels[address.toString()] ?? address.toString()}</TableTd>
                                <TableTd>{displayLamportsAsSol(balanceLamports)}</TableTd>
                            </TableTr>
                        ))}
                    </TableTbody>
                </Table>
            </SimpleGrid>
        </Container>
    )
}
