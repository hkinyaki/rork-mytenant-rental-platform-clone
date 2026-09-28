export const formatCurrency = (amount: number, currency: string = "TZS") => {
  return `${currency} ${amount.toLocaleString()}`;
};

/** Compact variant for chart/summary labels: TZS 1.35M, TZS 450K. */
export const formatCurrencyCompact = (amount: number, currency: string = "TZS") => {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `${currency} ${Math.round(amount / 1_000)}K`;
  }
  return `${currency} ${amount}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
