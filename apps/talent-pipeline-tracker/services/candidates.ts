import type { CandidateListResponse, CandidateRecord } from "@/types/candidate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCandidates(): Promise<CandidateRecord[]> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL configuration.");
  }

  const response = await fetch(`${API_URL}/records`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch candidates (${response.status}).`);
  }

  const payload = (await response.json()) as CandidateListResponse;
  return payload.data ?? [];
}