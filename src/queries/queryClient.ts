import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // only make one RPC request per address
      // we can just refresh to get fresh data if needed
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});
