"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { EVENT_TYPES, EventType } from "@/lib/eventStyles";
import ShowDialog from "@/components/admin/shows/ShowDialog";
import type {
  ShowForm,
  FOHStaffingAssignment,
} from "@/components/admin/shows/types";

export default function AdminShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [fohStaffing, setFohStaffing] = useState<FOHStaffingAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [crewSearchTerm, setCrewSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingShowId, setEditingShowId] = useState<number | null>(null);
  const [documentActivity, setDocumentActivity] = useState<any[]>([]);
  const [externalCrew, setExternalCrew] = useState<any[]>([]);
  const [assignedExternalCrewIds, setAssignedExternalCrewIds] = useState<number[]>([]);

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

  const [newShow, setNewShow] = useState<ShowForm>(emptyForm);
  const [editShow, setEditShow] = useState<ShowForm>(emptyForm);

  useEffect(() => {
    loadExternalCrew();
    loadShows();
    loadStaff();
    loadVenues();
  }, []);

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

  async function toggleExternalCrewAssignment(showId: number, externalCrewId: number) {
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

    setAssignedExternalCrewIds((prev) =>
      prev.filter((id) => id !== externalCrewId)
    );
  } else {
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

    setAssignedExternalCrewIds((prev) => [...prev, externalCrewId]);
  }
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

    setAssignedStaffIds((prev) => prev.filter((id) => id !== userId));
  } else {
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

    setAssignedStaffIds((prev) => [...prev, userId]);
  }
}

  async function addShow() {
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
      console.error("add show failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to add show.");
      return;
    }
if (newShow.date_time) {
  const { error: eventError } = await supabase
    .from("show_events")
    .insert([
      {
        show_id: insertedShow.id,
        event_type: "Show",
        start_time: formatLocalDateTime(newShow.date_time),
        end_time: null,
        crew_call: newShow.crew_call || null,
        report_type: "Both",
        cancelled: newShow.cancelled,
        notes: null,
      },
    ]);

  if (eventError) {
    console.error(
      "Create default show event failed:",
      JSON.stringify(eventError, null, 2)
    );

    alert(
      eventError.message ||
        "The show was created, but the default schedule event failed."
    );
  }
}

    await saveFOHStaffing(insertedShow.id);

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
        action: "show_added",
        description: `Added show: ${newShow.name}`,
        user_id: user?.id,
        user_name: profile?.display_name || "Unknown User",
        show_id: insertedShow.id,
      },
    ]);

    setNewShow(emptyForm);
    setFohStaffing([]);
    setShowAddForm(false);
    loadShows();
  }

  function openEditForm(show: any) {
    setEditingShowId(show.id);
    setCrewSearchTerm("");
    loadAssignedStaff(show.id);
    loadFOHStaffing(show.id);
    loadDocuments(show.id);
    loadDocumentActivity(show.id);

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

  async function updateShow() {
    if (!editingShowId) return;

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

    await saveFOHStaffing(editingShowId);

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
        action: "show_edited",
        description: `Edited show: ${editShow.name}`,
        user_id: user?.id,
        user_name: profile?.display_name || "Unknown User",
        show_id: editingShowId,
      },
    ]);

    setEditShow(emptyForm);
    setEditingShowId(null);
    setFohStaffing([]);
    setShowEditForm(false);
    loadShows();
  }

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

  return (
<AppLayout>
  <div className="space-y-6">
   <div className="sticky top-0 z-40 -mx-6 -mt-6 space-y-4 border-b border-zinc-800 bg-zinc-950 px-6 pt-[92px] pb-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">Manage Shows</h1>
        </div>

        <button
          onClick={() => {
            setAssignedStaffIds([]);
            setCrewSearchTerm("");
            setFohStaffing([]);
            setShowAddForm(true);
            setAssignedExternalCrewIds([]);
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
            className={`flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm event-pattern-${style.pattern} ${
              eventTypeFilter === eventType
                ? "border-white ring-2 ring-white/30"
                : "border-zinc-700"
            }`}
          >
            <span className="font-medium text-white">
              {eventType}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">       
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
    </div>

    {/* Your shows section goes below here */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-3">
            {filteredShows.map((show) => {
              const eventType =
              (show.event_type as EventType) || "Show";
              
              const eventStyle = EVENT_TYPES[eventType];
              const patternClass = `event-pattern-${eventStyle.pattern}`;
              
              return (
              <div
              key={show.id}
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
                        backgroundColor:
                        show.venues?.calendar_colour || "#6366f1",
                      }}
                      />
                  
                    <p className={`font-semibold ${
                      show.cancelled
                      ? "text-zinc-300 line-through"
                      : "text-white"
                    }`}
                    >
                      {show.name}
                    </p>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${ show.cancelled ? "text-zinc-500" : "text-zinc-400"}`}>
                      {new Date(show.date_time).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        })}{" "}
                      •{" "}
                      {new Date(show.date_time).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        })}
                    </p>
                      
                    <p className={`text-sm ${ show.cancelled ? "text-zinc-500" : "text-zinc-400" }`}>
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
                    onClick={() => openEditForm(show)}
                    className="border-l border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                  >
                    Edit
                  </button>
                  </div>
              </div>
              );
            })}
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
        crewMembers={staffMembers}
        assignedCrewIds={assignedStaffIds}
        editingShowId={null}
        toggleCrewAssignment={toggleStaffAssignment}
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
        venues={venues}
        fohStaffing={fohStaffing}
        setFohStaffing={setFohStaffing}
        externalCrew={externalCrew}
        assignedExternalCrewIds={assignedExternalCrewIds}
        toggleExternalCrewAssignment={toggleExternalCrewAssignment}
      />

      <ShowDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        title="Edit Show"
        form={editShow}
        setForm={setEditShow}
        onSave={updateShow}
        saveLabel="Update Show"
        crewMembers={staffMembers}
        assignedCrewIds={assignedStaffIds}
        editingShowId={editingShowId}
        toggleCrewAssignment={toggleStaffAssignment}
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
        venues={venues}
        fohStaffing={fohStaffing}
        setFohStaffing={setFohStaffing}
        externalCrew={externalCrew}
        assignedExternalCrewIds={assignedExternalCrewIds}
        toggleExternalCrewAssignment={toggleExternalCrewAssignment}
      />
    </AppLayout>
  );
}








function formatLocalDateTime(date: Date | null) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}
