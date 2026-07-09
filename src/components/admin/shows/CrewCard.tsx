import type { ReactNode } from "react";

export default function CrewCard({
  crew,
  assigned,
  disabled,
  onClick,
}: {
  crew: any;
  assigned: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const initials =
    crew.display_name
      ?.split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
        assigned ? "border-green-500 bg-green-950/30" : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${assigned ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-200"}`}>
          {initials}
        </div>
        <div>
          <p className="font-medium text-white">{crew.display_name}</p>
          <p className="text-sm text-zinc-500">{crew.job_roles?.join(", ") || "Crew member"}</p>
          <p className="mt-1 inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
            {crew.department || "No department"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          assigned ? "bg-green-600 hover:bg-green-500" : "bg-indigo-600 hover:bg-indigo-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {assigned ? "Assigned" : "Assign"}
      </button>
    </div>
  );
}