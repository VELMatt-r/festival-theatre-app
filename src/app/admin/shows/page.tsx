"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
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

type ShowForm = {
  name: string;
  cancelled: boolean;
  date_time: Date | null;
  venue: string;
  crew_call: string;
  arrival_time: string;
  running_time: string;
  contact_name: string;
  contact_role: string;
  phone_number: string;
  email_address: string;
  company_vehicles: string;
  lawn_seating: boolean;
  notes: string;
};

export default function AdminShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [assignedCrewIds, setAssignedCrewIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [crewSearchTerm, setCrewSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingShowId, setEditingShowId] = useState<number | null>(null);
  const [documentActivity, setDocumentActivity] = useState<any[]>([]);

  const emptyForm: ShowForm = {
    name: "",
    cancelled: false,
    date_time: null,
    venue: "",
    crew_call: "",
    arrival_time: "",
    running_time: "",
    contact_name: "",
    contact_role: "",
    phone_number: "",
    email_address: "",
    company_vehicles: "",
    lawn_seating: false,
    notes: "",
  };

  const [newShow, setNewShow] = useState<ShowForm>(emptyForm);
  const [editShow, setEditShow] = useState<ShowForm>(emptyForm);

  async function loadShows() {
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .order("date_time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setShows(data || []);
  }

  async function loadCrew() {
    const { data, error } = await supabase
      .from("crew")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setCrewMembers(data || []);
  }

  async function loadAssignedCrew(showId: number) {
    const { data, error } = await supabase
      .from("show_crew")
      .select("crew_id")
      .eq("show_id", showId);

    if (error) {
      console.error(error);
      return;
    }

    setAssignedCrewIds(data?.map((item) => item.crew_id) || []);
  }

  async function loadDocuments(showId: number) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("show_id", showId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setDocuments(data || []);
  }

  async function loadDocumentActivity(showId: number) {
    const { data, error } = await supabase
      .from("document_activity")
      .select("*")
      .eq("show_id", showId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setDocumentActivity(data || []);
  }

  async function toggleCrewAssignment(showId: number, crewId: number) {
    const isAssigned = assignedCrewIds.includes(crewId);

    if (isAssigned) {
      const { error } = await supabase
        .from("show_crew")
        .delete()
        .eq("show_id", showId)
        .eq("crew_id", crewId);

      if (error) {
        console.error(error);
        return;
      }

      setAssignedCrewIds((prev) => prev.filter((id) => id !== crewId));
    } else {
      const { error } = await supabase.from("show_crew").insert([
        {
          show_id: showId,
          crew_id: crewId,
        },
      ]);

      if (error) {
        console.error(error);
        return;
      }

      setAssignedCrewIds((prev) => [...prev, crewId]);
    }
  }

  useEffect(() => {
    loadShows();
    loadCrew();
  }, []);

  async function addShow() {
    const { error } = await supabase.from("shows").insert([
      {
        name: newShow.name,
        cancelled: newShow.cancelled,
        date_time: newShow.date_time?.toISOString(),
        venue: newShow.venue,
        crew_call: newShow.crew_call,
        arrival_time: newShow.arrival_time,
        running_time: newShow.running_time,
        contact_name: newShow.contact_name,
        contact_role: newShow.contact_role,
        phone_number: newShow.phone_number,
        email_address: newShow.email_address,
        company_vehicles: newShow.company_vehicles,
        lawn_seating: newShow.lawn_seating,
        notes: newShow.notes,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setNewShow(emptyForm);
    setShowAddForm(false);
    loadShows();
  }

  function openEditForm(show: any) {
    setEditingShowId(show.id);
    setCrewSearchTerm("");
    loadAssignedCrew(show.id);
    loadDocuments(show.id);
    loadDocumentActivity(show.id);

    setEditShow({
      name: show.name || "",
      cancelled: show.cancelled || false,
      date_time: show.date_time ? new Date(show.date_time) : null,
      venue: show.venue || "",
      crew_call: show.crew_call || "",
      arrival_time: show.arrival_time || "",
      running_time: show.running_time || "",
      contact_name: show.contact_name || "",
      contact_role: show.contact_role || "",
      phone_number: show.phone_number || "",
      email_address: show.email_address || "",
      company_vehicles: show.company_vehicles || "",
      lawn_seating: show.lawn_seating || false,
      notes: show.notes || "",
    });

    setShowEditForm(true);
  }

  async function updateShow() {
    if (!editingShowId) return;

    const { error } = await supabase
      .from("shows")
      .update({
        name: editShow.name,
        cancelled: editShow.cancelled,
        date_time: editShow.date_time?.toISOString(),
        venue: editShow.venue,
        crew_call: editShow.crew_call,
        arrival_time: editShow.arrival_time,
        running_time: editShow.running_time,
        contact_name: editShow.contact_name,
        contact_role: editShow.contact_role,
        phone_number: editShow.phone_number,
        email_address: editShow.email_address,
        company_vehicles: editShow.company_vehicles,
        lawn_seating: editShow.lawn_seating,
        notes: editShow.notes,
      })
      .eq("id", editingShowId);

    if (error) {
      console.error(error);
      return;
    }

    setEditShow(emptyForm);
    setEditingShowId(null);
    setShowEditForm(false);
    loadShows();
  }

  const filteredShows = shows.filter((show) => {
    const search = searchTerm.toLowerCase();

    return (
      show.name?.toLowerCase().includes(search) ||
      show.venue?.toLowerCase().includes(search)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">Manage Shows</h1>
          </div>

          <button
            onClick={() => {
              setAssignedCrewIds([]);
              setCrewSearchTerm("");
              setShowAddForm(true);
            }}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            Add Show
          </button>
        </div>

        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search shows or venues..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
        />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-3">
            {filteredShows.map((show) => (
              <div
                key={show.id}
                className="flex items-center justify-between rounded-xl bg-zinc-800 p-4"
              >
                <div>
                  <p className="font-semibold">{show.name}</p>

                  <p className="text-sm text-zinc-400">
                    {new Date(show.date_time).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {show.venue}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/shows/${show.id}`}
                    className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => openEditForm(show)}
                    className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ShowDialog
        open={showAddForm}
        onOpenChange={setShowAddForm}
        title="Add Show"
        form={newShow}
        setForm={setNewShow}
        onSave={addShow}
        saveLabel="Save Show"
        crewMembers={crewMembers}
        assignedCrewIds={assignedCrewIds}
        editingShowId={null}
        toggleCrewAssignment={toggleCrewAssignment}
        crewSearchTerm={crewSearchTerm}
        setCrewSearchTerm={setCrewSearchTerm}
        documents={documents}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        documentName={documentName}
        setDocumentName={setDocumentName}
        uploadingDocument={uploadingDocument}
        setUploadingDocument={setUploadingDocument}
        loadDocuments={loadDocuments}
        documentActivity={documentActivity}
        loadDocumentActivity={loadDocumentActivity}
      />

      <ShowDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        title="Edit Show"
        form={editShow}
        setForm={setEditShow}
        onSave={updateShow}
        saveLabel="Update Show"
        crewMembers={crewMembers}
        assignedCrewIds={assignedCrewIds}
        editingShowId={editingShowId}
        toggleCrewAssignment={toggleCrewAssignment}
        crewSearchTerm={crewSearchTerm}
        setCrewSearchTerm={setCrewSearchTerm}
        documents={documents}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        documentName={documentName}
        setDocumentName={setDocumentName}
        uploadingDocument={uploadingDocument}
        setUploadingDocument={setUploadingDocument}
        loadDocuments={loadDocuments}
        documentActivity={documentActivity}
        loadDocumentActivity={loadDocumentActivity}
      />
    </AppLayout>
  );
}

function ShowDialog({
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  form: ShowForm;
  setForm: (form: ShowForm) => void;
  onSave: () => void;
  saveLabel: string;
  crewMembers: any[];
  assignedCrewIds: number[];
  editingShowId: number | null;
  toggleCrewAssignment: (showId: number, crewId: number) => Promise<void>;
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
}) {
  const filteredCrew = crewMembers.filter((crew) => {
    const search = crewSearchTerm.toLowerCase();

    return (
      crew.name?.toLowerCase().includes(search) ||
      crew.role?.toLowerCase().includes(search)
    );
  });

  const assignedCrew = filteredCrew.filter((crew) =>
    assignedCrewIds.includes(crew.id)
  );

  const availableCrew = filteredCrew.filter(
    (crew) => !assignedCrewIds.includes(crew.id)
  );

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
          <TabsList className="grid w-full grid-cols-5 bg-zinc-800 h-14">
            <TabsTrigger
              value="show"
              className="text-zinc-300 text-base font-medium data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
            >
              Show
            </TabsTrigger>

            <TabsTrigger
              value="company"
              className="text-zinc-300 text-base font-medium data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
            >
              Visiting Company
            </TabsTrigger>

            <TabsTrigger
              value="notes"
              className="text-zinc-300 text-base font-medium data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
            >
              Notes
            </TabsTrigger>

            <TabsTrigger
              value="crew"
              className="text-zinc-300 text-base font-medium data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
            >
              Crew
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="text-zinc-300 text-base font-medium data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
            >
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="show">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Show Name">
                <input
                  placeholder="Show Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Show Cancelled">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      cancelled: !form.cancelled,
                    })
                  }
                  className="flex h-[50px] w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-left"
                >
                  <span className="text-sm text-zinc-300">
                    {form.cancelled ? "Cancelled" : "Active"}
                  </span>

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.cancelled ? "bg-red-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        form.cancelled ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              </Field>

              <Field label="Show Date & Time">
                <DatePicker
                  selected={form.date_time}
                  onChange={(date) => setForm({ ...form, date_time: date })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd MMM yyyy HH:mm"
                  placeholderText="Select date and time"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Venue">
                <input
                  placeholder="Hever Festival Theatre"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Crew Call">
                <DatePicker
                  selected={
                    form.crew_call
                      ? new Date(`1970-01-01T${form.crew_call}`)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (!date) return;

                    const hours = String(date.getHours()).padStart(2, "0");
                    const minutes = String(date.getMinutes()).padStart(2, "0");

                    setForm({
                      ...form,
                      crew_call: `${hours}:${minutes}`,
                    });
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  placeholderText="Select crew call"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Arrival Time">
                <DatePicker
                  selected={
                    form.arrival_time
                      ? new Date(`1970-01-01T${form.arrival_time}`)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (!date) return;

                    const hours = String(date.getHours()).padStart(2, "0");
                    const minutes = String(date.getMinutes()).padStart(2, "0");

                    setForm({
                      ...form,
                      arrival_time: `${hours}:${minutes}`,
                    });
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  placeholderText="Select arrival time"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Running Time">
                <input
                  value={form.running_time}
                  onChange={(e) =>
                    setForm({ ...form, running_time: e.target.value })
                  }
                  placeholder="45 - 20 - 45"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Contact Name">
                <input
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Contact Role">
                <input
                  value={form.contact_role}
                  onChange={(e) =>
                    setForm({ ...form, contact_role: e.target.value })
                  }
                  placeholder="Tour Manager"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Phone Number">
                <input
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                  }
                  placeholder="07700 900123"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <Field label="Email Address">
                <input
                  value={form.email_address}
                  onChange={(e) =>
                    setForm({ ...form, email_address: e.target.value })
                  }
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Company Vehicles">
                  <input
                    value={form.company_vehicles}
                    onChange={(e) =>
                      setForm({ ...form, company_vehicles: e.target.value })
                    }
                    placeholder="1 van, 2 cars. Include registrations where possible."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                  />
                </Field>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="mt-6 space-y-6">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.lawn_seating}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lawn_seating: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm text-zinc-300">Lawn Seating</span>
              </label>

              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={8}
                  placeholder="Add operational notes..."
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="mt-6 space-y-5">
              <input
                value={crewSearchTerm}
                onChange={(event) => setCrewSearchTerm(event.target.value)}
                placeholder="Search crew by name or role..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
              />

              {!editingShowId && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                  Save the show first, then edit it to assign crew.
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <section>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-semibold text-green-400">
                      Assigned Crew ({assignedCrew.length})
                    </h3>
                    <p className="text-sm text-zinc-500">Click to remove</p>
                  </div>

                  <div className="space-y-3">
                    {assignedCrew.map((crew) => (
                      <CrewCard
                        key={crew.id}
                        crew={crew}
                        assigned
                        disabled={!editingShowId}
                        onClick={() => {
                          if (!editingShowId) return;
                          toggleCrewAssignment(editingShowId, crew.id);
                        }}
                      />
                    ))}

                    {assignedCrew.length === 0 && (
                      <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                        No crew assigned yet.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-semibold text-white">
                      Available Crew ({availableCrew.length})
                    </h3>
                    <p className="text-sm text-zinc-500">Click to assign</p>
                  </div>

                  <div className="space-y-3">
                    {availableCrew.map((crew) => (
                      <CrewCard
                        key={crew.id}
                        crew={crew}
                        assigned={false}
                        disabled={!editingShowId}
                        onClick={() => {
                          if (!editingShowId) return;
                          toggleCrewAssignment(editingShowId, crew.id);
                        }}
                      />
                    ))}

                    {availableCrew.length === 0 && (
                      <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                        No available crew found.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="mt-6 space-y-5">
              {!editingShowId && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                  Save the show first, then edit it to upload documents.
                </div>
              )}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Upload Document</h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Document name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                  />

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={!editingShowId || !selectedFile || uploadingDocument}
                  onClick={uploadDocument}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingDocument ? "Uploading..." : "Upload Document"}
                </button>
              </div>

              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <span className="font-medium text-white">
                      {document.name}
                    </span>

                    <div className="flex gap-2">
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    No documents uploaded yet.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Activity Log</h3>

                <div className="mt-4 space-y-3">
                  {documentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
                    >
                      <span className="font-medium text-white">
                        {activity.performed_by || "admin"}
                      </span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium text-white">
                        {activity.document_name}
                      </span>

                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(activity.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}

                  {documentActivity.length === 0 && (
                    <p className="text-sm text-zinc-500">
                      No document activity yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSave}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            {saveLabel}
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CrewCard({
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
    crew.name
      ?.split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
        assigned
          ? "border-green-500 bg-green-950/30"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
            assigned ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-200"
          }`}
        >
          {initials}
        </div>

        <div>
          <p className="font-medium text-white">{crew.name}</p>
          <p className="text-sm text-zinc-500">
            {crew.role || "Crew member"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          assigned
            ? "bg-green-600 hover:bg-green-500"
            : "bg-indigo-600 hover:bg-indigo-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {assigned ? "Assigned" : "Assign"}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">{label}</label>
      {children}
    </div>
  );
}