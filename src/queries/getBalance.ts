import {
  Address,
  GetBalanceApi,
  LamportsUnsafeBeyond2Pow53Minus1,
  Rpc,
  lamports,
} from "@solana/web3.js";
import { QueryKey } from "@tanstack/react-query";

export function getBalanceQueryKey(address: Address): QueryKey {
  return ["balance", address];
}

export async function getBalance(
  rpc: Rpc<GetBalanceApi>,
  address: Address,
  abortSignal: AbortSignal
): Promise<LamportsUnsafeBeyond2Pow53Minus1> {
  const { value } = await rpc
    .getBalance(address, { commitment: "confirmed" })
    .send({ abortSignal });
  return value;
}
