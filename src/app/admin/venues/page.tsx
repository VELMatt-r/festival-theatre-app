"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Venue = {
  id: number;
  name: string;
  address: string | null;
  requires_opening_checks: boolean;
  status: string | null;
  technical_contact_name?: string;
  calendar_colour: string | null;
};
type VenueDocument = {
    id: number;
    venue_id: number;
    name: string;
    file_url: string;
    file_path: string;
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [requiresOpeningChecks, setRequiresOpeningChecks] =
  useState(false);
  const [status, setStatus] = useState("active");
  const [documents, setDocuments] = useState<VenueDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [calendarColour, setCalendarColour] = useState("#6366f1");

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setVenues(data || []);
  }
async function loadVenueDocuments(venueId: number) {
  const { data, error } = await supabase
    .from("venue_documents")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setDocuments(data || []);
}
  function resetForm() {
    setEditingVenue(null);
    setName("");
    setAddress("");
    setRequiresOpeningChecks(false);
    setStatus("active");
    setCalendarColour("#6366f1");
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(venue: Venue) {
    setEditingVenue(venue);
    setName(venue.name || "");
    setAddress(venue.address || "");
    setRequiresOpeningChecks(venue.requires_opening_checks || false);
    setStatus(venue.status || "active");
    loadVenueDocuments(venue.id);
    setCalendarColour(venue.calendar_colour || "#6366f1");
    setModalOpen(true);
  }

  async function saveVenue() {
    if (!name.trim()) {
      alert("Venue name is required.");
      return;
    }

    const payload = {
      name,
      address,
      requires_opening_checks: requiresOpeningChecks,
      status,
      calendar_colour: calendarColour,
    };

    if (editingVenue) {
      const { error } = await supabase
        .from("venues")
        .update(payload)
        .eq("id", editingVenue.id);

      if (error) {
        console.error(error);
        alert("Failed to update venue.");
        return;
      }
    } else {
      const { error } = await supabase.from("venues").insert([payload]);

      if (error) {
        console.error(error);
        alert("Failed to add venue.");
        return;
      }
    }

    setModalOpen(false);
    resetForm();
    await loadVenues();
  }

  async function deleteVenue(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this venue?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("venues").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete venue.");
      return;
    }

    await loadVenues();
  }
async function uploadDocument(
  event: React.ChangeEvent<HTMLInputElement>
) {
  if (!editingVenue) return;

  const file = event.target.files?.[0];

  if (!file) return;

  setUploading(true);

  const filePath = `${editingVenue.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("venue_documents")
    .upload(filePath, file);

  if (uploadError) {
    console.error(uploadError);
    alert("Failed to upload document.");
    setUploading(false);
    return;
  }

  const { data } = supabase.storage
    .from("venue_documents")
    .getPublicUrl(filePath);

  const { error: insertError } = await supabase
    .from("venue_documents")
    .insert([
      {
        venue_id: editingVenue.id,
        name: file.name,
        file_url: data.publicUrl,
        file_path: filePath,
      },
    ]);

  if (insertError) {
    console.error(insertError);
    alert("Failed to save document.");
    setUploading(false);
    return;
  }

  await loadVenueDocuments(editingVenue.id);

  setUploading(false);
}
async function deleteDocument(document: VenueDocument) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this technical document?"
  );

  if (!confirmed) return;

  const { error: storageError } = await supabase.storage
    .from("venue_documents")
    .remove([document.file_path]);

  if (storageError) {
    console.error(storageError);
    alert("Failed to delete file from storage.");
    return;
  }

  const { error: dbError } = await supabase
    .from("venue_documents")
    .delete()
    .eq("id", document.id);

  if (dbError) {
    console.error(dbError);
    alert("Failed to delete document record.");
    return;
  }

  if (editingVenue) {
    await loadVenueDocuments(editingVenue.id);
  }
}
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        venue.name?.toLowerCase().includes(searchValue) ||
        venue.address?.toLowerCase().includes(searchValue) ||
        venue.technical_contact_name?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || venue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [venues, search, statusFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">Manage Venues</h1>

            <p className="mt-2 text-zinc-400">
              Manage venue details, technical contacts and operational notes.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            Add Venue
          </button>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search venues..."
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="flex flex-col gap-4 rounded-xl bg-zinc-800 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: venue.calendar_colour || "#6366f1",
                      }}
                    />
                      
                    <p className="text-lg font-semibold text-white">
                      {venue.name}
                    </p>
                  </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${
                        venue.status === "inactive"
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {venue.status || "active"}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400">
                    {venue.address || "No address set"}
                  </p>

                  <p className="text-sm text-zinc-500">
  Opening Checks:{" "}
  {venue.requires_opening_checks ? "Required" : "Not Required"}
</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(venue)}
                    className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteVenue(venue.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredVenues.length === 0 && (
              <p className="text-sm text-zinc-500">No venues found.</p>
            )}
          </div>
        </section>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingVenue ? "Edit Venue" : "Add Venue"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
  <input
    value={name}
    onChange={(event) => setName(event.target.value)}
    placeholder="Venue Name"
    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white md:col-span-2"
  />

  <input
    value={address}
    onChange={(event) => setAddress(event.target.value)}
    placeholder="Venue Address"
    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white md:col-span-2"
  />

  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 md:col-span-2">
    <input
      type="checkbox"
      checked={requiresOpeningChecks}
      onChange={(event) =>
        setRequiresOpeningChecks(event.target.checked)
      }
      className="h-5 w-5"
    />

    <span className="text-sm text-zinc-300">
      Requires Opening Checks
    </span>
  </label>

  <div className="rounded-x1 border border-zinc-800 bg-zinc-950 px-4 py-3 md:col-span-2">
    <label className="mb-2 block text-sm text-zinc-400">
      Calendar Colour
    </label>

    <div className="flex items-center gap-3">
      <input
        type="color"
        value={calendarColour}
        onChange={(event) => setCalendarColour(event.target.value)}
        className="h-10 curosr-pointer rounded border border-Zinc-700 bg-zinc-900"
    />

    <span className="text-sm text-zinc-400">
      {calendarColour}
    </span>
    </div>
  </div>
  <select
    value={status}
    onChange={(event) => setStatus(event.target.value)}
    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white md:col-span-2"
  >
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
  <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:col-span-2">
  <div>
    <h3 className="text-lg font-semibold">
      Technical Documents
    </h3>

    <p className="text-sm text-zinc-500">
      Upload venue technical specifications and PDFs.
    </p>
  </div>

  {editingVenue && (
    <>
      <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-500">
  {uploading ? "Uploading..." : "Upload Document"}

  <input
    type="file"
    accept=".pdf"
    onChange={uploadDocument}
    disabled={uploading}
    className="hidden"
  />
</label>

      {uploading && (
        <p className="text-sm text-zinc-500">
          Uploading document...
        </p>
      )}

      <div className="space-y-2">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
          >
            <p className="text-sm text-zinc-300">
              {document.name}
            </p>

            <Link
              href={document.file_url}
              target="_blank"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-500"
            >
              View PDF
            </Link>
            <button
  type="button"
  onClick={() => deleteDocument(document)}
  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-500"
>
  Delete
</button>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="text-sm text-zinc-500">
            No documents uploaded yet.
          </p>
        )}
      </div>
    </>
  )}
</div>
            <div className="flex gap-3 pt-2 md:col-span-2">
              <button
                type="button"
                onClick={saveVenue}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
              >
                {editingVenue ? "Save Changes" : "Add Venue"}
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}