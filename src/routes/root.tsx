import { useWallet } from "@wallet-standard/react-core";
import { useMemo } from "react";
import { useWalletLocalStorage } from "../hooks/useWalletLocalStorage";
import { WalletMultiButton } from "../components/WalletMultiButton";
import { Button, Container, Flex, Loader, MantineColor, SimpleGrid, Stack, Table, TableData, Text, TextInput } from "@mantine/core";
import { shortAddress } from "../components/AccountLabel";
import { ActionFunctionArgs, Form, useActionData, useNavigation } from "react-router-dom";
import { Address, LamportsUnsafeBeyond2Pow53Minus1, createSolanaRpc, isAddress, mainnet } from "@solana/web3.js";
import { displayLamportsAsSol } from "../utils/lamports";
import { PieChart, PieChartCell } from "@mantine/charts";
import { queryClient } from '../queries/queryClient';
import { getBalance, getBalanceQueryKey } from "../queries/getBalance";
import AccountCheckboxes from "../components/AccountCheckboxes";

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
        const balanceLamports = await queryClient.fetchQuery({
            queryKey: getBalanceQueryKey(address),
            queryFn: () => getBalance(rpc, address, request.signal)
        })
        data.push({ address, balanceLamports })
    }

    data.sort((a, b) => Number(b.balanceLamports - a.balanceLamports));

    return {
        kind: 'success',
        data,
    }
}

const colors: MantineColor[] = ["red", "blue", "yellow", "green", "orange", "grape", "pink", "cyan", "lime", "white"]

type TableRow = {
    address: Address,
    balanceLamports: LamportsUnsafeBeyond2Pow53Minus1 | undefined
};

function makeTableRowData(
    fetchedData: AddressWithBalance[],
    pendingAddresses: Address[] | undefined,
): TableRow[] {
    const isPending = pendingAddresses !== undefined;
    const pendingAddressesSet = new Set(pendingAddresses);
    const fetchedAddressesSet = new Set(fetchedData.map(({ address }) => address))

    // filter pending to remove already fetched, since the data won't change
    const filteredPendingAddresses = pendingAddresses?.filter((address) => !fetchedAddressesSet.has(address)) ?? [];

    // if pending, remove from fetched if it is not in the pending addresses
    // this means if the user unselected the checkbox, we immediately remove it
    const filteredFetchedData = isPending ?
        fetchedData.filter(({ address }) => pendingAddressesSet.has(address)) :
        fetchedData;

    const pendingRows: TableRow[] = (filteredPendingAddresses ?? []).map(address => ({
        address,
        balanceLamports: undefined
    }));

    return (filteredFetchedData as TableRow[]).concat(...pendingRows);
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
        const addresses = navigation.formData?.getAll('addresses');
        return addresses?.map(a => a.toString() as Address)
    }, [navigation.formData])

    const fetchedData = useMemo(() => {
        return actionData?.kind === 'success' ? actionData.data : []
    }, [actionData]);

    const tableRowData = useMemo(() => {
        return makeTableRowData(fetchedData, pendingAddresses)
    }, [fetchedData, pendingAddresses]);

    const tableData: TableData = {
        head: [
            hasLabels ? "Label" : "Address",
            "Unstaked SOL"
        ],
        body: tableRowData.map(({ address, balanceLamports }) => [
            addressLabels[address.toString()] ?? address,
            balanceLamports ? displayLamportsAsSol(balanceLamports) : <Loader size='xs' />
        ])
    }

    const pieChartData: PieChartCell[] = useMemo(() => {
        return tableRowData
            .filter(({ balanceLamports }) => balanceLamports !== undefined)
            .slice(0, 10)
            .map(({ address, balanceLamports }, index) => ({
                name: addressLabels[address] ?? shortAddress(address),
                value: Number(balanceLamports),
                color: colors[index]
            }))
    }, [tableRowData, addressLabels]);

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
                                    // TODO: probably make this work better with a single account
                                    // maybe just hide it all and just have the fetch button?
                                    <AccountCheckboxes accounts={accounts} />
                                    :
                                    <Text> Connect a wallet to get started...</Text>
                                }
                            </Stack>

                            <Button type="submit" fit-content="true" disabled={pendingAddresses !== undefined}>
                                Fetch
                            </Button>
                        </Flex>
                    </Form>
                </Flex>

                <Stack>
                    <Table striped withRowBorders withTableBorder data={tableData} />

                    <Container mih={300} miw={300}>
                        {
                            pieChartData.length > 0 ?
                                <PieChart
                                    size={200}
                                    data={pieChartData}
                                    withTooltip
                                    tooltipProps={{ wrapperStyle: { background: 'white', color: 'darkblue', padding: 4 } }}
                                    tooltipDataSource='segment'
                                    valueFormatter={n => `${displayLamportsAsSol(BigInt(n))} SOL`}
                                    style={{ width: '100%', height: '100%' }}
                                /> : null
                        }
                    </Container>
                </Stack>
            </SimpleGrid>
        </Container>
    )
}
