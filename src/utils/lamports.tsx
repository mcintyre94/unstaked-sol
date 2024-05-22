export function displayLamportsAsSol(lamports: bigint) {
    const formatter = new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: 9
    });
    // @ts-expect-error (seems to not know about the scientific notation)
    return formatter.format(`${lamports}E-9`)
}