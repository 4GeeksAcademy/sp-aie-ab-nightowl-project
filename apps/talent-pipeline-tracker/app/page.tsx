"use client";

import { useEffect, useMemo, useState } from "react";

import { CandidateFilters } from "@/components/candidate-filters";
import { fetchCandidates } from "@/services/candidates";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  type CandidateRecord,
  type CandidateStage,
  type CandidateStatus,
} from "@/types/candidate";

export default function Home() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "all">(
    "all",
  );
  const [selectedStage, setSelectedStage] = useState<CandidateStage | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCandidates();
        setCandidates(response);
      } catch {
        setError("We could not load candidates right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStatus =
        selectedStatus === "all" || candidate.status === selectedStatus;
      const matchesStage =
        selectedStage === "all" || candidate.stage === selectedStage;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        candidate.full_name.toLowerCase().includes(normalizedQuery) ||
        candidate.email.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesStage && matchesQuery;
    });
  }, [candidates, query, selectedStatus, selectedStage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white px-4 py-10 text-zinc-900 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
            Brasaland People and Culture
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Executive Assistant Talent Pipeline Tracker
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Candidate overview for the active search at corporate headquarters,
            Medellin.
          </p>
        </header>

        <CandidateFilters
          query={query}
          selectedStatus={selectedStatus}
          selectedStage={selectedStage}
          onQueryChange={setQuery}
          onStatusChange={setSelectedStatus}
          onStageChange={setSelectedStage}
        />

        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4 text-sm text-zinc-600">
            Showing {filteredCandidates.length} candidates
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-zinc-600">Loading candidates...</p>
          ) : null}

          {error ? <p className="px-5 py-8 text-sm text-red-600">{error}</p> : null}

          {!loading && !error ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Candidate</th>
                    <th className="px-5 py-3 font-semibold">Position</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-orange-50/60">
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{candidate.full_name}</p>
                        <p className="text-xs text-zinc-500">{candidate.email}</p>
                      </td>
                      <td className="px-5 py-4 text-zinc-700">{candidate.position}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {STATUS_LABELS[candidate.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-700">
                        {STAGE_LABELS[candidate.stage]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && !error && filteredCandidates.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-600">
              No candidates match the current filters.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
