"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/format";

const NAV_LINKS = [
  { href: "/", label: "Bridge" },
  { href: "/history", label: "History" },
  { href: "/status", label: "Status" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-white">
            <span className="text-gradient">QFC</span> Bridge
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300">
                {shortenAddress(address!)}
              </span>
              <button
                onClick={disconnect}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
