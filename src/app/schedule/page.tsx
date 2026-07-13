"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

import { EVENT_TYPES, EventType } from "@/lib/eventStyles";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase";

type StaffMember = {
  name: string;
  department: string | null;
  assignmentType: string;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [venues, setVenues] = useState<any[]>([]);
  const [venueFilter, setVenueFilter] = useState("all");

  useEffect(() => {
    loadShows();
    loadVenues();
  }, []);

 async function loadShows() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, department")
      .eq("id", user.id)
      .single();

    setProfile(profileData);
  }

const { data, error } = await supabase
  .from("show_events")
  .select(`
    id,
    title,
    event_type,
    start_time,
    end_time,
    crew_call,
    report_type,
    cancelled,
    notes,

    show_event_staff (
      id,
      profiles (
        display_name,
        department
      ),
      external_crew (
        display_name,
        department
      )
    ),

    shows (
      id,
      name,
      venue,
      venue_id,
      cancelled,

      venues (
        id,
        name,
        calendar_colour
      ),

      show_foh_staffing (
        role_label,
        staff_name,
        notes
      )
    )
  `)
  .order("start_time", { ascending: true });

  if (error) {
    console.error("Load schedule events failed:", error);
    return;
  }

  const formattedEvents =
    data?.map((event: any) => {
      const show = event.shows;

      const technicalStaff =
        event.show_event_staff?.map((assignment: any) => ({
          name:
            assignment.profiles?.display_name ||
            assignment.external_crew?.display_name ||
            "Unknown",
          department:
            assignment.profiles?.department ||
            assignment.external_crew?.department ||
            "Technical",
          assignmentType: "technical",
        })) || [];

      const fohStaff =
        show?.show_foh_staffing?.map((assignment: any) => ({
          name:
            assignment.staff_name ||
            assignment.role_label ||
            "Unknown",
          department: "FOH",
          assignmentType: "foh",
        })) || [];

      const cancelled =
        event.cancelled || show?.cancelled || false;

      return {
        id: String(event.id),
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        display: "block",
        backgroundColor: cancelled ? "#b91c1c" : undefined,
        borderColor: cancelled ? "#991b1b" : undefined,
        extendedProps: {
          cancelled,
          venue: show?.venue,
          venueColour:
            show?.venues?.calendar_colour || "#6366f1",
          eventType: event.event_type || "Show",
          crewCall: event.crew_call,
          reportType: event.report_type,
          notes: event.notes,
          showId: show?.id,
          showName: show?.name,
          venueId: show?.venue_id,
          technicalStaff,
          fohStaff,
        },
      };
    }) || [];

  setEvents(formattedEvents);
}
 async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select("id, name, calendar_colour, status")
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setVenues(data || []);
  }

  const isAdmin = profile?.role === "admin" || profile?.role === "Admin";
  const userDepartment = profile?.department?.toLowerCase() || "";

  const technicalStaff =
    selectedEvent?.extendedProps?.technicalStaff || [];

  const fohStaff =
    selectedEvent?.extendedProps?.fohStaff || [];

    const filteredEvents = events.filter((event) => {
      const matchesEventType =
        eventTypeFilter === "all" ||
        event.extendedProps?.eventType === eventTypeFilter;

      const matchesVenue =
        venueFilter === "all" ||
        String(event.extendedProps?.venueId) === venueFilter;

      return matchesEventType && matchesVenue;
    });
    
    return (
    <AppLayout>
      <div className="sticky top-0 z-40 -mx-6 -mt-6 space-y-4 border-b border-zinc-800 bg-zinc-950 px-6 pt-[92px] pb-5 shadow-xl">
  <div>
    <h1 className="text-3xl font-bold">Schedule</h1>

    <p className="mt-2 text-zinc-400">
      View and manage upcoming shows
    </p>
  </div>

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
            : "border-zinc-700 hover:bg-zinc-800"
        }`}
      >
        <span className="font-medium text-white">{eventType}</span>
      </button>
    ))}

    <button
      type="button"
      onClick={() => setEventTypeFilter("all")}
      className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
    >
      All
    </button>
  </div>
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
        <span className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: venue.calendar_colour || "#6366f1",
          }}
        />

        <span className="text-sm text-white">{venue.name}</span>
      </button>
    ))}
    </div>
</div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          firstDay={1}
          height="auto"
          events={filteredEvents}
          eventClassNames={(info) => {
            const eventType =
            (info.event.extendedProps.eventType || "Show") as EventType;

            const eventStyle = EVENT_TYPES[eventType] || EVENT_TYPES.Show;

            const classes = [`event-pattern-${eventStyle.pattern}`];

            if (info.event.extendedProps.cancelled) {
            classes.push("cancelled-event");
            }

            return classes;
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventContent={(info) => {
            const venueColour =
            info.event.extendedProps.venueColour || "#6366f1";

            return (
              <div className="flex items-center gap-2">
                <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: venueColour }}
                />

                <span
                className={
                  info.event.extendedProps.cancelled
                  ? "line-through"
                  : ""
                  }
                >
                  {info.event.title}
              </span>
            </div>
          );
          }}
          eventClick={(info) => {
            setSelectedEvent(info.event);
          }}
        />
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <p className="text-sm tiext-zinc-400">
              {selectedEvent?.extendedProps?.showName}
            </p>
            <DialogTitle className="text-2xl font-bold">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <InfoBlock
              label="Event Time"
              value={selectedEvent?.start?.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />

            <InfoBlock
              label="Venue"
              value={selectedEvent?.extendedProps?.venue}
            />

            {!userDepartment.includes("foh") && (
  <InfoBlock
    label="Technical Crew Call"
    value={selectedEvent?.extendedProps?.crewCall?.slice(
      0,
      5
    )}
  />
)}

            {isAdmin ? (
              <div className="space-y-4">
                <StaffSection
                  title="Technical Crew"
                  staff={technicalStaff}
                />

                <StaffSection
                  title="FOH Crew"
                  staff={fohStaff}
                />
              </div>
            ) : userDepartment.includes("technical") ? (
              <StaffSection
                title="Technical Crew"
                staff={technicalStaff}
              />
            ) : userDepartment.includes("foh") ? (
              <StaffSection title="FOH Crew" staff={fohStaff} />
            ) : null}

            {(isAdmin || !userDepartment.includes("foh")) && (
  <Link
    href={`/shows/${selectedEvent?.extendedProps?.showId}`}
    className="block w-full rounded-xl bg-indigo-600 py-3 text-center font-medium transition hover:bg-indigo-500"
  >
    More Details
  </Link>
)}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-medium">
        {value || "Not set"}
      </p>
    </div>
  );
}

function StaffSection({
  title,
  staff,
}: {
  title: string;
  staff: StaffMember[];
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-zinc-400">{title}</p>

      <div className="flex flex-wrap gap-2">
        {staff.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No staff assigned.
          </p>
        ) : (
          staff.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium"
            >
              {member.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}