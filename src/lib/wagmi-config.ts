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

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "idrop-dev-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "IDROP",
  appDescription: "Academia onchain abierta sobre BNB Chain",
  appUrl: "https://idrop.so",
  projectId,
  chains: WAGMI_CHAINS,
  ssr: true,
});
