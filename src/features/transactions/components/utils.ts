import type { Transaction } from "../../../types";

export interface TransactionSection {
  title: string;
  data: Transaction[];
}

export function formatDateMDY(date: Date): string {
  // Force MM/DD/YYYY with slashes regardless of device locale.
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeMDY(date: Date): string {
  // MM/DD/YYYY, hh:mm AM/PM
  const datePart = formatDateMDY(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${datePart} ${timePart}`;
}

export function groupTransactionsByMonth(transactions: Transaction[]): TransactionSection[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const d = new Date(t.createdAt);
    const title = d.toLocaleString(undefined, { month: "short", year: "numeric" });
    const arr = groups.get(title) ?? [];
    arr.push(t);
    groups.set(title, arr);
  }

  // Preserve chronological order by newest first within each group and by group.
  const sections = Array.from(groups.entries()).map(([title, data]) => ({
    title,
    data: data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }));

  sections.sort((a, b) => {
    const ta = new Date(a.data[0]?.createdAt ?? 0).getTime();
    const tb = new Date(b.data[0]?.createdAt ?? 0).getTime();
    return tb - ta;
  });

  return sections;
}


