"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi-config";

import "@rainbow-me/rainbowkit/styles.css";

/**
 * Web3Providers — wagmi + react-query + RainbowKit, themed to IDROP v2 palette.
 *
 * Wrapped at the locale layout level so every page (landing + lesson) has
 * `useAccount`, `useChainId`, etc. available, even when no wallet is connected.
 * The QueryClient lives in component state so SSR + client don't share one
 * (per react-query SSR docs).
 */
export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#F0B90B",
            accentColorForeground: "#15110a",
            borderRadius: "small",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
