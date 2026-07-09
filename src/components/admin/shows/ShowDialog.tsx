import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { supabase } from "@/lib/supabase";
import type { EventType } from "@/lib/eventStyles";

import Field from "./Field";
import TimeOnlyField from "./TimeOnlyField";
import CrewList from "./CrewList";
import ExternalCrewList from "./ExternalCrewList";
import ShowTab from "./ShowTab";

import type {
    ShowForm,
    FOHStaffingAssignment,
} from "./types";

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

export default function ShowDialog({
  open,
  onOpenChange,
  title,
  form,
  setForm,
  onSave,
  saveLabel,
  crewMembers,
  assignedCrewIds,
  editingShowId,
  toggleCrewAssignment,
  crewSearchTerm,
  setCrewSearchTerm,
  documents,
  selectedFile,
  setSelectedFile,
  documentName,
  setDocumentName,
  uploadingDocument,
  setUploadingDocument,
  loadDocuments,
  documentActivity,
  loadDocumentActivity,
  venues,
  fohStaffing,
  setFohStaffing,
  externalCrew,
  assignedExternalCrewIds,
  toggleExternalCrewAssignment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  form: ShowForm;
  setForm: (form: ShowForm) => void;
  onSave: () => void;
  saveLabel: string;
  crewMembers: any[];
  assignedCrewIds: string[];
  editingShowId: number | null;
  toggleCrewAssignment: (showId: number, userId: string) => Promise<void>;
  crewSearchTerm: string;
  setCrewSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  documents: any[];
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  documentName: string;
  setDocumentName: React.Dispatch<React.SetStateAction<string>>;
  uploadingDocument: boolean;
  setUploadingDocument: React.Dispatch<React.SetStateAction<boolean>>;
  loadDocuments: (showId: number) => Promise<void>;
  documentActivity: any[];
  loadDocumentActivity: (showId: number) => Promise<void>;
  venues: any[];
  fohStaffing: FOHStaffingAssignment[];
  setFohStaffing: React.Dispatch<React.SetStateAction<FOHStaffingAssignment[]>>;
  externalCrew: any[];
  assignedExternalCrewIds: number[];
  toggleExternalCrewAssignment: (
  showId: number,
  externalCrewId: number
) => Promise<void>;
}) {
  const activeCrewMembers = crewMembers.filter(
  (crew) => crew.disabled !== true
);

  const technicalCrew = activeCrewMembers.filter((crew) => {
    const search = crewSearchTerm.toLowerCase();

    const matchesSearch =
      crew.display_name?.toLowerCase().includes(search) ||
      crew.job_roles?.some((role: string) =>
  role.toLowerCase().includes(search)
);

    return crew.department === "Technical" && matchesSearch;
  });

  const fohCrew = activeCrewMembers.filter((crew) =>
  crew.department?.toLowerCase().includes("foh")
);

  const assignedCrew = technicalCrew.filter((crew) =>
    assignedCrewIds.includes(crew.id)
  );

  const availableCrew = technicalCrew.filter(
    (crew) => !assignedCrewIds.includes(crew.id)
  );
const technicalExternalCrew = externalCrew.filter((crew) => {
  const search = crewSearchTerm.toLowerCase();

  const matchesSearch =
    crew.display_name?.toLowerCase().includes(search) ||
    crew.job_roles?.some((role: string) =>
      role.toLowerCase().includes(search)
    );

  return crew.department === "Technical" && matchesSearch;
});

const assignedExternalCrew = technicalExternalCrew.filter((crew) =>
  assignedExternalCrewIds.includes(crew.id)
);

const availableExternalCrew = technicalExternalCrew.filter(
  (crew) => !assignedExternalCrewIds.includes(crew.id)
);

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

  async function uploadDocument() {
    if (!editingShowId || !selectedFile) return;

    setUploadingDocument(true);

    const filePath = `${editingShowId}/${Date.now()}-${selectedFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("show_documents")
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error(uploadError);
      setUploadingDocument(false);
      return;
    }

    const { data } = supabase.storage
      .from("show_documents")
      .getPublicUrl(filePath);

    const finalDocumentName = documentName || selectedFile.name;

    const { data: insertedDocument, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          show_id: editingShowId,
          name: finalDocumentName,
          file_url: data.publicUrl,
          file_path: filePath,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      setUploadingDocument(false);
      return;
    }

    await supabase.from("document_activity").insert([
      {
        show_id: editingShowId,
        document_id: insertedDocument.id,
        action: "uploaded",
        document_name: finalDocumentName,
        file_url: data.publicUrl,
        performed_by: "admin",
      },
    ]);

    setSelectedFile(null);
    setDocumentName("");
    setUploadingDocument(false);

    await loadDocuments(editingShowId);
    await loadDocumentActivity(editingShowId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{title}</DialogTitle>
        </DialogHeader>

<Tabs defaultValue="show" className="mt-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
  <TabsList className="flex h-auto w-max min-w-full gap-1 rounded-xl bg-zinc-800 p-1">
    <TabsTrigger
      value="show"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      Show
    </TabsTrigger>

    <TabsTrigger
      value="company"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      <span className="hidden sm:inline">Visiting Company</span>
      <span className="sm:hidden">Company</span>
    </TabsTrigger>

    <TabsTrigger
      value="notes"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      Notes
    </TabsTrigger>

    <TabsTrigger
      value="crew"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      <span className="hidden sm:inline">Technical Crew</span>
      <span className="sm:hidden">Tech</span>
    </TabsTrigger>

    <TabsTrigger
      value="foh"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      <span className="hidden sm:inline">FOH Staffing</span>
      <span className="sm:hidden">FOH</span>
    </TabsTrigger>

    <TabsTrigger
      value="documents"
      className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base"
    >
      <span className="hidden sm:inline">Documents</span>
      <span className="sm:hidden">Docs</span>
    </TabsTrigger>
  </TabsList>
</div>

         

          <TabsContent value="company">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TimeOnlyField label="Arrival Time" value={form.arrival_time} onChange={(value) => setForm({ ...form, arrival_time: value })} />
              <Field label="Contact Name"><input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Alex Morgan" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
              <Field label="Contact Role"><input value={form.contact_role} onChange={(e) => setForm({ ...form, contact_role: e.target.value })} placeholder="Tour Manager" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
              <Field label="Phone Number"><input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="07700 900123" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
              <Field label="Email Address"><input value={form.email_address} onChange={(e) => setForm({ ...form, email_address: e.target.value })} placeholder="alex@example.com" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
              <div className="md:col-span-2"><Field label="Company Vehicles"><input value={form.company_vehicles} onChange={(e) => setForm({ ...form, company_vehicles: e.target.value })} placeholder="1 van, 2 cars. Include registrations where possible." className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field></div>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="mt-6 space-y-6">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                <input type="checkbox" checked={form.lawn_seating} onChange={(e) => setForm({ ...form, lawn_seating: e.target.checked })} className="h-5 w-5" />
                <span className="text-sm text-zinc-300">Lawn Seating</span>
              </label>

              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={8} placeholder="Add operational notes..." className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" />
              </Field>
            </div>
          </TabsContent>

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

          <TabsContent value="documents">
            <div className="mt-6 space-y-5">
              {!editingShowId && <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">Save the show first, then edit it to upload documents.</div>}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Upload Document</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Document name" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white" />
                  <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  console.log("Selected file:", file);
                  setSelectedFile(file);
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                />
                </div>
                <button type="button" disabled={!editingShowId || !selectedFile || uploadingDocument} onClick={uploadDocument} className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {uploadingDocument ? "Uploading..." : "Upload Document"}
                </button>
              </div>

              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                    <span className="font-medium text-white">{document.name}</span>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600">View</a>
                  </div>
                ))}
                {documents.length === 0 && <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">No documents uploaded yet.</p>}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Activity Log</h3>
                <div className="mt-4 space-y-3">
                  {documentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                      <span className="font-medium text-white">{activity.performed_by || "admin"}</span> {activity.action} <span className="font-medium text-white">{activity.document_name}</span>
                      <p className="mt-1 text-xs text-zinc-500">{new Date(activity.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ))}
                  {documentActivity.length === 0 && <p className="text-sm text-zinc-500">No document activity yet.</p>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-3">
          <button onClick={onSave} className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500">
            {saveLabel}
          </button>
          <button onClick={() => onOpenChange(false)} className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}