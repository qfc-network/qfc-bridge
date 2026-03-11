export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortenTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function formatAmount(value: string | number, decimals = 4): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
