import { useListState } from "@mantine/hooks";
import { WalletAccount } from "@wallet-standard/base"
import { AccountLabel } from "./AccountLabel";
import { Checkbox } from "@mantine/core";

type Props = {
    accounts: readonly WalletAccount[]
};

export default function AccountCheckboxes({ accounts }: Props) {
    const initialValues = accounts.map(account => ({
        account,
        checked: true,
    }));

    const [values, handlers] = useListState(initialValues);

    const allChecked = values.every((value) => value.checked);
    const indeterminate = values.some((value) => value.checked) && !allChecked;

    const accountCheckboxes = values.map((value, index) => (
        <Checkbox
            name='addresses'
            size='md'
            ml='md'
            key={value.account.address}
            value={value.account.address}
            checked={value.checked}
            label={<AccountLabel account={value.account} />}
            onChange={(e) => handlers.setItemProp(index, "checked", e.currentTarget.checked)}
        />
    ));

    return (
        <>
            <Checkbox
                size='md'
                mb='sm'
                checked={allChecked}
                indeterminate={indeterminate}
                aria-label="Toggle all accounts"
                onChange={() => handlers.setState(current =>
                    current.map(value => ({ ...value, checked: !allChecked }))
                )}
            />
            {accountCheckboxes}
        </>
    )

}