/**
 * Wagmi + RainbowKit configuration for IDROP.
 *
 * Chains (per user spec, multi-chain BNB roadmap):
 * - BNB Smart Chain mainnet (56)        — production XP claims
 * - BNB Smart Chain testnet (97)        — staging
 * - opBNB testnet (5611)                — cheap claim UX experiments
 *
 * The WalletConnect projectId is read from env. If absent (e.g. local dev
 * without setting it up) RainbowKit still works but WalletConnect-based wallets
 * will fail to connect — MetaMask / injected works regardless.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet, opBNB, opBNBTestnet } from "wagmi/chains";

export const WAGMI_CHAINS = [bsc, bscTestnet, opBNB, opBNBTestnet] as const;

const envProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/**
 * In production we require a real projectId — without one WalletConnect-based
 * wallets (Rainbow, Trust, mobile) fail silently when the user tries to
 * connect, which is much worse than failing loud at boot. Free projectIds
 * are available at https://cloud.walletconnect.com.
 *
 * In dev we keep a placeholder so contributors can run `npm run dev` without
 * needing the env var; MetaMask / injected wallets still work either way.
 */
if (!envProjectId && process.env.NODE_ENV === "production") {
  throw new Error(
    "[wagmi-config] Missing required env `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. " +
      "Get one free at https://cloud.walletconnect.com and add it to your Vercel project."
  );
}

if (!envProjectId && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi-config] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set — WalletConnect-based wallets will fail to connect. MetaMask/injected still works."
  );
}

const projectId = envProjectId ?? "idrop-dev-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "IDROP",
  appDescription: "Academia onchain abierta sobre BNB Chain",
  appUrl: "https://idrop.so",
  projectId,
  chains: WAGMI_CHAINS,
  ssr: true,
});
