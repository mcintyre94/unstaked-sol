import { WalletAccount } from "@wallet-standard/base"
import { AccountLabel } from "./AccountLabel";
import { Checkbox } from "@mantine/core";
import { useState } from "react";

type Props = {
    accounts: readonly WalletAccount[]
};

export default function AccountCheckboxes({ accounts }: Props) {
    const [checkedStates, setCheckedStates] = useState(Array.from({ length: accounts.length }, () => true))

    const allChecked = checkedStates.every(value => value);
    const indeterminate = checkedStates.some(value => value) && !allChecked;

    const accountCheckboxes = accounts.map((account, index) => (
        <Checkbox
            name='addresses'
            size='md'
            ml='md'
            key={account.address}
            value={account.address}
            checked={checkedStates[index]}
            label={<AccountLabel account={account} />}
            onChange={(e) => setCheckedStates(current => {
                const updated = [...current];
                updated[index] = e.target.checked;
                return updated
            })}
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
                onChange={() => setCheckedStates(Array.from({ length: accounts.length }, () => !allChecked))}
            />
            {accountCheckboxes}
        </>
    )

}