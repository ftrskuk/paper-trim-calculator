import type { CalculatorSnapshot, HistoryItem, HistorySummary } from "@/types";

type SaveResponse = {
  item: HistorySummary;
};

type ListResponse = {
  items?: HistorySummary[];
};

type DetailResponse = {
  item: HistoryItem;
};

export async function listHistory(): Promise<HistorySummary[]> {
  const response = await fetch("/api/history", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load history");
  }

  const data = (await response.json()) as ListResponse;
  return data.items ?? [];
}

export async function saveCalculation(payload: {
  name: string;
  snapshot: CalculatorSnapshot;
}) {
  const response = await fetch("/api/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save calculation");
  }

  return (await response.json()) as SaveResponse;
}

export async function updateCalculation(payload: {
  id: string;
  name?: string;
  snapshot?: CalculatorSnapshot;
}) {
  const response = await fetch("/api/history", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update calculation");
  }

  return (await response.json()) as SaveResponse;
}

export async function deleteCalculation(id: string) {
  const response = await fetch(`/api/history?id=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete calculation");
  }

  return response.json();
}

export async function fetchCalculation(id: string) {
  const response = await fetch(`/api/history?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch calculation");
  }

  return (await response.json()) as DetailResponse;
}

