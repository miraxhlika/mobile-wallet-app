import type { TransactionStatus } from "../../../types";

export function transactionStatusLabel(status: TransactionStatus): string {
  // API uses "failed" for declined transactions in our UI copy.
  if (status === "failed") return "Declined";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function transactionStatusColor(status: TransactionStatus): string {
  switch (status) {
    case "completed":
      return "#4E9A62";
    case "pending":
      return "#D7D8DE";
    case "failed":
    case "cancelled":
      return "#ED5951";
    default:
      return "#D7D8DE";
  }
}


