"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTranslations } from "next-intl";

/**
 * V2ConnectButton — editorial wrapper around RainbowKit's `ConnectButton.Custom`.
 *
 * Three visual states:
 * - Not connected:  "↗ CONECTAR WALLET"                         (mono mc)
 * - Wrong network:  "⚠ RED NO SOPORTADA"                        (warning)
 * - Connected:      "✓ 0x12…ab" + small chain icon + balance     (mono)
 *
 * All states keep the same border-only treatment to stay visually quiet next
 * to the BNB-yellow "Empezar" CTA.
 */
export function V2ConnectButton() {
  const t = useTranslations("v2.masthead");

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            aria-hidden={!ready}
            style={{
              opacity: ready ? 1 : 0,
              pointerEvents: ready ? "auto" : "none",
              userSelect: ready ? "auto" : "none",
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="v2-mono v2-mc v2-wallet-btn"
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      color: "var(--color-t-1)",
                      border: "1px solid var(--color-line-3)",
                      fontSize: 10.5,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>↗</span>
                    <span>{t("connectWallet")}</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="v2-mono v2-mc v2-wallet-btn"
                    style={{
                      padding: "8px 12px",
                      background: "rgba(220, 90, 60, 0.08)",
                      color: "var(--color-ember)",
                      border: "1px solid var(--color-ember)",
                      fontSize: 10.5,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>⚠</span>
                    <span>{t("wrongNetwork")}</span>
                  </button>
                );
              }

              return (
                <div style={{ display: "inline-flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="v2-mono v2-mc v2-wallet-btn"
                    style={{
                      padding: "8px 10px",
                      background: "transparent",
                      color: "var(--color-t-1)",
                      border: "1px solid var(--color-line-2)",
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    aria-label={`Network: ${chain.name}`}
                  >
                    {chain.hasIcon && chain.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={chain.iconUrl}
                        alt={chain.name ?? "chain"}
                        width={12}
                        height={12}
                        style={{ borderRadius: 2 }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          background: "var(--color-bnb)",
                          transform: "rotate(45deg)",
                          display: "inline-block",
                        }}
                      />
                    )}
                    <span>{chain.name?.replace("BNB Smart Chain", "BSC")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="v2-mono v2-mc v2-wallet-btn"
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      color: "var(--color-bnb)",
                      border: "1px solid var(--color-bnb-line)",
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "var(--color-bnb)" }}>✓</span>
                    <span className="v2-tnum">{account.displayName}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
