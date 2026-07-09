import { TabsContent } from "@/components/ui/tabs";

import type { FOHStaffingAssignment } from "./types";

const FOH_STAFFING_ROLES = [
  { key: "house_manager", label: "House Manager" },
  { key: "box_office", label: "Box Office" },
  { key: "top_gate", label: "Top Gate" },
  { key: "lake_view", label: "Lake View" },
  { key: "tickets", label: "Tickets" },
  { key: "auditorium_l", label: "Auditorium L" },
  { key: "auditorium_r", label: "Auditorium R" },
  { key: "bell", label: "Bell" },
  { key: "cushions", label: "Cushions" },
  { key: "emergency_vehicle_gate", label: "Emergency Vehicle Gate" },
  { key: "defib_runner", label: "Defib Runner" },
];

export default function FOHStaffingTab({
    editingShowId,
    fohStaffing,
    setFohStaffing,
    fohCrew,
}: {
    editingShowId: number | null;
    fohStaffing: FOHStaffingAssignment[];
    setFohStaffing: React.Dispatch<React.SetStateAction<FOHStaffingAssignment[]>>;
    fohCrew: any[];
}) {
    function updateFOHStaffing(
    roleKey: string,
    roleLabel: string,
    field: "staff_name" | "notes",
    value: string
  ) {
    setFohStaffing((current) => {
      const existingIndex = current.findIndex(
        (item) => item.role_key === roleKey
      );

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: value,
        };
        return updated;
      }

      return [
        ...current,
        {
          role_key: roleKey,
          role_label: roleLabel,
          staff_name: field === "staff_name" ? value : "",
          notes: field === "notes" ? value : "",
        },
      ];
    });
  }
  return (
    <TabsContent value="foh">
      <div className="mt-6 space-y-4">
                {!editingShowId && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                        You can prepare FOH staffing now. It will be saved when the show is created.
                    </div>
                )}
        
                {FOH_STAFFING_ROLES.map((role) => {
                    const assignment = fohStaffing.find(
                        (item) => item.role_key === role.key
                    );
        
                    return (
                        <div key={role.key} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm text-zinc-400">{role.label}</label>
                                    <select
                                        value={assignment?.staff_name || ""}
                                        onChange={(e) => updateFOHStaffing(role.key, role.label, "staff_name", e.target.value)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                                    >
                                  <option value="">Select Staff Member</option>
                                    {fohCrew
                                        .filter((crew) => {
                                                if (role.label === "House Manager") {
                                                return crew.job_roles?.includes ("House Manager");
                                                }
        
                                                if (role.label === "Box Office") {
                                                    return crew.job_roles?.includes ("Box Office");
                                                }
        
                                            return true;
                                        })
                                        .map((crew) => (
                                            <option key={crew.id} value={crew.display_name}>
                                                {crew.display_name}
                                            </option>
                                        ))}
                                </select>
                              </div>
        
                              <div>
                                <label className="mb-2 block text-sm text-zinc-400">Notes</label>
                                <input
                                  value={assignment?.notes || ""}
                                  onChange={(e) => updateFOHStaffing(role.key, role.label, "notes", e.target.value)}
                                  placeholder="Notes"
                                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                                />
                              </div>
                            </div>
                        </div>
                    );
                })}
            </div>
    </TabsContent>
  );
}
