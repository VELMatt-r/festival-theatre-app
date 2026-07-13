"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import ShowDialog from "@/components/admin/shows/ShowDialog";

import { supabase } from "@/lib/supabase";
import { EVENT_TYPES, EventType } from "@/lib/eventStyles";

import {
  createShowEvents,
  loadShowEvents,
  replaceShowEvents,
} from "@/components/admin/shows/eventActions";

import type {
  ShowForm,
  FOHStaffingAssignment,
  ShowEventForm,
} from "@/components/admin/shows/types";

// =====================================================
// Constants
// =====================================================

const emptyForm: ShowForm = {
  name: "",
  event_type: "Show",
  cancelled: false,
  date_time: null,
  venue: "",
  venue_id: null,
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

// =====================================================
// Page Component
// =====================================================

export default function AdminShowsPage() {
  // =====================================================
  // Page Data
  // =====================================================

  const [shows, setShows] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [externalCrew, setExternalCrew] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);

  // =====================================================
  // Filters
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");

  // =====================================================
  // Dialog State
  // =====================================================

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingShowId, setEditingShowId] = useState<number | null>(null);
  const [showEvents, setShowEvents] = useState<ShowEventForm[]>([]);

  const [newShow, setNewShow] = useState<ShowForm>(emptyForm);
  const [editShow, setEditShow] = useState<ShowForm>(emptyForm);

  // =====================================================
  // Crew / Staffing State
  // =====================================================

  const [crewSearchTerm, setCrewSearchTerm] = useState("");
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [assignedExternalCrewIds, setAssignedExternalCrewIds] = useState<number[]>([]);
  const [fohStaffing, setFohStaffing] = useState<FOHStaffingAssignment[]>([]);

  // =====================================================
  // Documents State
  // =====================================================

  const [documents, setDocuments] = useState<any[]>([]);
  const [documentActivity, setDocumentActivity] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    await Promise.all([
      loadShows(),
      loadStaff(),
      loadExternalCrew(),
      loadVenues(),
    ]);
  }

  // =====================================================
  // Data Loading
  // =====================================================

  async function loadShows() {
    const { data, error } = await supabase
      .from("shows")
      .select(`
        *,
        venues (
          id,
          name,
          calendar_colour
        )
      `)
      .order("date_time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setShows(data || []);
  }

  async function loadStaff() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, phone_number, role, department, job_roles, disabled")
      .eq("disabled", false)
      .order("display_name");

    if (error) {
      console.error(error);
      return;
    }

    setStaffMembers(data || []);
  }

  async function loadExternalCrew() {
    const { data, error } = await supabase
      .from("external_crew")
      .select("*")
      .eq("status", "active")
      .order("display_name");

    if (error) {
      console.error(error);
      return;
    }

    setExternalCrew(data || []);
  }

  async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setVenues(data || []);
  }

  async function loadAssignedStaff(showId: number) {
    const { data, error } = await supabase
      .from("show_staff")
      .select("user_id, external_crew_id")
      .eq("show_id", showId)
      .eq("assignment_type", "technical");

    if (error) {
      console.error(error);
      return;
    }

    setAssignedStaffIds(
      data?.filter((item) => item.user_id).map((item) => item.user_id) || []
    );

    setAssignedExternalCrewIds(
      data
        ?.filter((item) => item.external_crew_id)
        .map((item) => item.external_crew_id) || []
    );
  }

  async function loadFOHStaffing(showId: number) {
    const { data, error } = await supabase
      .from("show_foh_staffing")
      .select("*")
      .eq("show_id", showId);

    if (error) {
      console.error(error);
      return;
    }

    setFohStaffing(data || []);
  }

  async function loadDocuments(showId: number) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("show_id", showId)
      .order("created_at", { ascending: false });

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

  // =====================================================
  // Dialog Helpers
  // =====================================================

  function resetDialogState() {
    setCrewSearchTerm("");
    setAssignedStaffIds([]);
    setAssignedExternalCrewIds([]);
    setFohStaffing([]);
    setShowEvents([]);
    setDocuments([]);
    setDocumentActivity([]);
    setSelectedFile(null);
    setDocumentName("");
    setUploadingDocument(false);
  }

  function openAddForm() {
    resetDialogState();
    setNewShow(emptyForm);
    setShowAddForm(true);
  }

  function openEditForm(show: any) {
    resetDialogState();

    setEditingShowId(show.id);

    loadAssignedStaff(show.id);
    loadFOHStaffing(show.id);
    loadDocuments(show.id);
    loadDocumentActivity(show.id);
    loadShowEvents(show.id)
      .then(setShowEvents)
      .catch((error) => {
        console.error(error);
        alert(
          error instanceof Error
          ? error.message
          : "Failed to load show events."
        );
      });

    setEditShow({
      name: show.name || "",
      event_type: show.event_type || "Show",
      cancelled: show.cancelled || false,
      date_time: show.date_time ? new Date(show.date_time) : null,
      venue: show.venue || "",
      venue_id: show.venue_id || null,
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

  function closeAddForm(open: boolean) {
    setShowAddForm(open);
    if (!open) resetDialogState();
  }

  function closeEditForm(open: boolean) {
    setShowEditForm(open);
    if (!open) {
      resetDialogState();
      setEditingShowId(null);
      setEditShow(emptyForm);
    }
  }

  // =====================================================
  // Save Helpers
  // =====================================================

  async function saveFOHStaffing(showId: number) {
    const rows = fohStaffing
      .filter((item) => item.staff_name || item.notes)
      .map((item) => ({
        show_id: showId,
        role_key: item.role_key,
        role_label: item.role_label,
        staff_name: item.staff_name || null,
        notes: item.notes || null,
      }));

    const { error: deleteError } = await supabase
      .from("show_foh_staffing")
      .delete()
      .eq("show_id", showId);

    if (deleteError) {
      console.error("Delete FOH staffing failed:", deleteError);
      alert(deleteError.message || "Failed to update FOH staffing.");
      return;
    }

    if (rows.length === 0) return;

    const { error: insertError } = await supabase
      .from("show_foh_staffing")
      .insert(rows);

    if (insertError) {
      console.error("Save FOH staffing failed:", insertError);
      alert(insertError.message || "Failed to save FOH staffing.");
    }
  }

  async function addActivityLog(
    action: string,
    description: string,
    showId: number
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user?.id)
      .single();

    await supabase.from("activity_log").insert([
      {
        action,
        description,
        user_id: user?.id,
        user_name: profile?.display_name || "Unknown User",
        show_id: showId,
      },
    ]);
  }

  // =====================================================
  // CRUD Actions
  // =====================================================

  async function addShow() {
    if (showEvents.length === 0) {
      alert("Please add at least one event before creating the show");
      return;
    }
    const { data: insertedShow, error } = await supabase
      .from("shows")
      .insert([
        {
          name: newShow.name,
          event_type: newShow.event_type,
          cancelled: newShow.cancelled,
          date_time: formatLocalDateTime(newShow.date_time),
          venue: newShow.venue,
          venue_id: newShow.venue_id,
          crew_call: newShow.crew_call || null,
          arrival_time: newShow.arrival_time || null,
          running_time: newShow.running_time,
          contact_name: newShow.contact_name,
          contact_role: newShow.contact_role,
          phone_number: newShow.phone_number,
          email_address: newShow.email_address,
          company_vehicles: newShow.company_vehicles,
          lawn_seating: newShow.lawn_seating,
          notes: newShow.notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Add show failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to add show.");
      return;
    }

    try {
      await createShowEvents(insertedShow.id, showEvents);
    } catch (error) {
      console.error(error);
    
      const { error: rollbackError } = await supabase
        .from("shows")
        .delete()
        .eq("id", insertedShow.id);

      if (rollbackError) {
        console.error(
          "Failed to remove parent show after event creation failed:",
          rollbackError
        );

        alert(
          "The events could not be saved, and the incomplete parent show could not be removed automatically. Please check Manage Shows."
        );

        await loadShows();
        return;
      }

      alert(
        error instanceof Error
        ? error.message
        : "The show was created, but it's events could not be saved."
      );

      return;
    }
    
    await saveFOHStaffing(insertedShow.id);
    await addActivityLog("show_added", `Added show: ${newShow.name}`, insertedShow.id);

    setNewShow(emptyForm);
    setShowAddForm(false);
    resetDialogState();

    await loadShows();
  }

  async function updateShow() {
    if (!editingShowId) return;

    if (showEvents.length === 0) {
      alert("A show must have at lease one event.");
      return;
    }

    const { error } = await supabase
      .from("shows")
      .update({
        name: editShow.name,
        event_type: editShow.event_type,
        cancelled: editShow.cancelled,
        date_time: formatLocalDateTime(editShow.date_time),
        venue: editShow.venue,
        venue_id: editShow.venue_id,
        crew_call: editShow.crew_call || null,
        arrival_time: editShow.arrival_time || null,
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
      console.error("Update show failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to update show.");
      return;
    }

    try {
      await replaceShowEvents(editingShowId, showEvents);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
        ? error.message
        : "Failed to update show events."
      );

  return;
}
    await replaceShowEvents(editingShowId, showEvents);
    await saveFOHStaffing(editingShowId);
    await addActivityLog("show_edited", `Edited show: ${editShow.name}`, editingShowId);

    setEditShow(emptyForm);
    setEditingShowId(null);
    setShowEditForm(false);
    resetDialogState();

    await loadShows();
  }

  async function toggleStaffAssignment(showId: number, userId: string) {
    const isAssigned = assignedStaffIds.includes(userId);

    if (isAssigned) {
      const { error } = await supabase
        .from("show_staff")
        .delete()
        .eq("show_id", showId)
        .eq("user_id", userId)
        .eq("assignment_type", "technical");

      if (error) {
        console.error(error);
        return;
      }

      setAssignedStaffIds((current) => current.filter((id) => id !== userId));
      return;
    }

    const { error } = await supabase.from("show_staff").insert([
      {
        show_id: showId,
        user_id: userId,
        assignment_type: "technical",
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setAssignedStaffIds((current) => [...current, userId]);
  }

  async function toggleExternalCrewAssignment(
    showId: number,
    externalCrewId: number
  ) {
    const isAssigned = assignedExternalCrewIds.includes(externalCrewId);

    if (isAssigned) {
      const { error } = await supabase
        .from("show_staff")
        .delete()
        .eq("show_id", showId)
        .eq("external_crew_id", externalCrewId)
        .eq("assignment_type", "technical");

      if (error) {
        console.error(error);
        return;
      }

      setAssignedExternalCrewIds((current) =>
        current.filter((id) => id !== externalCrewId)
      );

      return;
    }

    const { error } = await supabase.from("show_staff").insert([
      {
        show_id: showId,
        external_crew_id: externalCrewId,
        assignment_type: "technical",
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setAssignedExternalCrewIds((current) => [...current, externalCrewId]);
  }

  // =====================================================
  // Derived Data
  // =====================================================

  const filteredShows = shows.filter((show) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      show.name?.toLowerCase().includes(search) ||
      show.venue?.toLowerCase().includes(search);

    const matchesEventType =
      eventTypeFilter === "all" || show.event_type === eventTypeFilter;

    const matchesVenue =
      venueFilter === "all" || String(show.venue_id) === venueFilter;

    return matchesSearch && matchesEventType && matchesVenue;
  });

  const sharedDialogProps = {
    crewMembers: staffMembers,
    assignedCrewIds: assignedStaffIds,
    toggleCrewAssignment: toggleStaffAssignment,
    crewSearchTerm,
    setCrewSearchTerm,

    events: showEvents,
    setEvents: setShowEvents,
    
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
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          eventTypeFilter={eventTypeFilter}
          setEventTypeFilter={setEventTypeFilter}
          venueFilter={venueFilter}
          setVenueFilter={setVenueFilter}
          venues={venues}
          onAddShow={openAddForm}
        />

        <ShowsList shows={filteredShows} onEditShow={openEditForm} />
      </div>

      <ShowDialog
        open={showAddForm}
        onOpenChange={closeAddForm}
        title="Add Show"
        form={newShow}
        setForm={setNewShow}
        onSave={addShow}
        saveLabel="Save Show"
        editingShowId={null}
        {...sharedDialogProps}
      />

      <ShowDialog
        open={showEditForm}
        onOpenChange={closeEditForm}
        title="Edit Show"
        form={editShow}
        setForm={setEditShow}
        onSave={updateShow}
        saveLabel="Update Show"
        editingShowId={editingShowId}
        {...sharedDialogProps}
      />
    </AppLayout>
  );
}

// =====================================================
// Page Header
// =====================================================

function PageHeader({
  searchTerm,
  setSearchTerm,
  eventTypeFilter,
  setEventTypeFilter,
  venueFilter,
  setVenueFilter,
  venues,
  onAddShow,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (value: string) => void;
  venueFilter: string;
  setVenueFilter: (value: string) => void;
  venues: any[];
  onAddShow: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 -mx-6 -mt-6 space-y-4 border-b border-zinc-800 bg-zinc-950 px-6 pt-[92px] pb-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">Manage Shows</h1>
        </div>

        <button
          type="button"
          onClick={onAddShow}
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

      <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        {Object.entries(EVENT_TYPES).map(([eventType, style]) => (
          <button
            type="button"
            key={eventType}
            onClick={() =>
              setEventTypeFilter(
                eventTypeFilter === eventType ? "all" : eventType
              )
            }
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm event-pattern-${style.pattern} ${
              eventTypeFilter === eventType
                ? "border-white ring-2 ring-white/30"
                : "border-zinc-700"
            }`}
          >
            <span className="font-medium text-white">{eventType}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Venues
        </p>

        <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          {venues.map((venue) => (
            <button
              type="button"
              key={venue.id}
              onClick={() =>
                setVenueFilter(
                  venueFilter === String(venue.id) ? "all" : String(venue.id)
                )
              }
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                venueFilter === String(venue.id)
                  ? "border-white ring-2 ring-white/30"
                  : "border-zinc-700"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: venue.calendar_colour || "#6366f1",
                }}
              />

              <span className="text-sm text-white">{venue.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Shows List
// =====================================================

function ShowsList({
  shows,
  onEditShow,
}: {
  shows: any[];
  onEditShow: (show: any) => void;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="space-y-3">
        {shows.map((show) => (
          <ShowListItem key={show.id} show={show} onEditShow={onEditShow} />
        ))}
      </div>
    </section>
  );
}

function ShowListItem({
  show,
  onEditShow,
}: {
  show: any;
  onEditShow: (show: any) => void;
}) {
  const eventType = (show.event_type as EventType) || "Show";
  const eventStyle = EVENT_TYPES[eventType];
  const patternClass = `event-pattern-${eventStyle.pattern}`;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        show.cancelled
          ? "border-red-800 bg-red-950/80"
          : `border-zinc-700 ${patternClass}`
      }`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: show.venues?.calendar_colour || "#6366f1",
            }}
          />

          <p
            className={`font-semibold ${
              show.cancelled ? "text-zinc-300 line-through" : "text-white"
            }`}
          >
            {show.name}
          </p>
        </div>

        <div className="mt-2 space-y-1">
          <p
            className={`text-sm ${
              show.cancelled ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {formatDisplayDate(show.date_time)} • {formatDisplayTime(show.date_time)}
          </p>

          <p
            className={`text-sm ${
              show.cancelled ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {show.venue || "No venue set"}
          </p>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <Link
          href={`/shows/${show.id}`}
          className="px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
        >
          View
        </Link>

        <button
          type="button"
          onClick={() => onEditShow(show)}
          className="border-l border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// =====================================================
// Helpers
// =====================================================

function formatLocalDateTime(date: Date | null) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

function formatDisplayDate(value: string | null) {
  if (!value) return "No date set";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayTime(value: string | null) {
  if (!value) return "No time set";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}