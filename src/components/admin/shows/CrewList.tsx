import CrewCard from "./CrewCard";
import type { ReactNode } from "react";

export default function CrewList({
  title,
  hint,
  crew,
  assigned,
  editingShowId,
  toggleCrewAssignment,
}: {
  title: string;
  hint: string;
  crew: any[];
  assigned: boolean;
  editingShowId: number | null;
  toggleCrewAssignment: (showId: number, userId: string) => Promise<void>;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h3 className={`font-semibold ${assigned ? "text-green-400" : "text-white"}`}>{title}</h3>
        <p className="text-sm text-zinc-500">{hint}</p>
      </div>
      <div className="space-y-3">
        {crew.map((member) => (
          <CrewCard
            key={member.id}
            crew={member}
            assigned={assigned}
            disabled={!editingShowId}
            onClick={() => {
              if (!editingShowId) return;
              toggleCrewAssignment(editingShowId, member.id);
            }}
          />
        ))}
        {crew.length === 0 && <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">No crew found.</p>}
      </div>
    </section>
  );
}