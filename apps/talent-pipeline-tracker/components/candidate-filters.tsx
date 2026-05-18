import type { CandidateStage, CandidateStatus } from "@/types/candidate";

interface CandidateFiltersProps {
  query: string;
  selectedStatus: CandidateStatus | "all";
  selectedStage: CandidateStage | "all";
  onQueryChange: (value: string) => void;
  onStatusChange: (value: CandidateStatus | "all") => void;
  onStageChange: (value: CandidateStage | "all") => void;
}

const statusOptions: Array<{ value: CandidateStatus; label: string }> = [
  { value: "received", label: "Received" },
  { value: "in_progress", label: "In progress" },
  { value: "selected", label: "Selected" },
  { value: "discarded", label: "Discarded" },
];

const stageOptions: Array<{ value: CandidateStage; label: string }> = [
  { value: "pending", label: "Pending review" },
  { value: "review", label: "Under review" },
  { value: "personal_interview", label: "Personal interview" },
  { value: "technical_interview", label: "Technical interview" },
  { value: "offer_presented", label: "Offer presented" },
];

export function CandidateFilters({
  query,
  selectedStatus,
  selectedStage,
  onQueryChange,
  onStatusChange,
  onStageChange,
}: CandidateFiltersProps) {
  return (
    <section className="grid gap-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:grid-cols-3">
      <label className="flex flex-col gap-2 text-sm text-zinc-700">
        Search by name or email
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="e.g. maria or maria@mail.com"
          className="h-11 rounded-xl border border-zinc-300 px-3 text-sm outline-none ring-offset-2 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-700">
        Filter by status
        <select
          value={selectedStatus}
          onChange={(event) =>
            onStatusChange(event.target.value as CandidateStatus | "all")
          }
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-2 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          <option value="all">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-700">
        Filter by stage
        <select
          value={selectedStage}
          onChange={(event) =>
            onStageChange(event.target.value as CandidateStage | "all")
          }
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-2 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          <option value="all">All stages</option>
          {stageOptions.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}