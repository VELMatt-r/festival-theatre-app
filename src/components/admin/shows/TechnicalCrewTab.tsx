import { TabsContent } from "@/components/ui/tabs";

import CrewList from "./CrewList";
import ExternalCrewList from "./ExternalCrewList";

export default function TechnicalCrewTab({
  crewSearchTerm,
  setCrewSearchTerm,
  editingShowId,
  assignedCrew,
  availableCrew,
  assignedExternalCrew,
  availableExternalCrew,
  toggleCrewAssignment,
  toggleExternalCrewAssignment,
}: {
  crewSearchTerm: string;
  setCrewSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  editingShowId: number | null;
  assignedCrew: any[];
  availableCrew: any[];
  assignedExternalCrew: any[];
  availableExternalCrew: any[];
  toggleCrewAssignment: (showId: number, userId: string) => Promise<void>;
  toggleExternalCrewAssignment: (
    showId: number,
    externalCrewId: number
  ) => Promise<void>;
}) {
  return (
    <TabsContent value="crew">
        <div className="mt-6 space-y-5">
            <input
                value={crewSearchTerm}
                onChange={(event) => setCrewSearchTerm(event.target.value)}
                placeholder="Search technical crew by name or role..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
                />
    
            {!editingShowId && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                Save the show first, then edit it to assign technical crew.
            </div>
            )}
    
      <div className="grid gap-6 md:grid-cols-2">
        <CrewList
            title={`Assigned User Crew (${assignedCrew.length})`}
            hint="Click to remove"
            crew={assignedCrew}
            assigned
            editingShowId={editingShowId}
            toggleCrewAssignment={toggleCrewAssignment}
            />
    
        <CrewList
            title={`Available User Crew (${availableCrew.length})`}
            hint="Click to assign"
            crew={availableCrew}
            assigned={false}
            editingShowId={editingShowId}
            toggleCrewAssignment={toggleCrewAssignment}
            />
    
        <ExternalCrewList
            title={`Assigned External Crew (${assignedExternalCrew.length})`}
            hint="Click to remove"
            crew={assignedExternalCrew}
            assigned
            editingShowId={editingShowId}
            toggleExternalCrewAssignment={toggleExternalCrewAssignment}
            />
    
        <ExternalCrewList
            title={`Available External Crew (${availableExternalCrew.length})`}
            hint="Click to assign"
            crew={availableExternalCrew}
            assigned={false}
            editingShowId={editingShowId}
            toggleExternalCrewAssignment={toggleExternalCrewAssignment}
            />
            </div>
        </div>
    </TabsContent>
  );
}