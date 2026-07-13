"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

import { EVENT_TYPES, type EventType } from "@/lib/eventStyles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ShowDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [show, setShow] = useState<any>(null);
  const [showEvents, setShowEvents] = useState<any[]>([]);
  const [selectedShowEvent, setSelectedShowEvent] = useState<any>(null);
  const [selectedEventCrew, setSelectedEventCrew] = useState<any[]>([]);
  const [loadingEventCrew, setLoadingEventCrew] = useState(false);
  const [fohStaffing, setFohStaffing] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadShow();
  }, [id]);

  async function loadShow() {
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

    const { data: showData, error: showError } = await supabase
      .from("shows")
      .select("*")
      .eq("id", id)
      .single();

    if (showError) {
      console.error(showError);
      return;
    }

    setShow(showData);

    const { data: eventData, error: eventError } = await supabase
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
        notes
      `)
      .eq("show_id", id)
      .order("start_time", { ascending: true });

    if (eventError) {
      console.error("Failed to load show events:", eventError);
      return;
    }

    setShowEvents(eventData || []);

       const { data: fohData, error: fohError } = await supabase
      .from("show_foh_staffing")
      .select("*")
      .eq("show_id", id);

    if (fohError) {
      console.error(fohError);
      return;
    }

    setFohStaffing(fohData || []);

    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .select("*")
      .eq("show_id", id);

    if (documentError) {
      console.error(documentError);
      return;
    }

    setDocuments(documentData || []);
  }
  
  async function loadEventCrew(eventId: number) {
  setLoadingEventCrew(true);

  const { data, error } = await supabase
    .from("show_event_staff")
    .select(`
      id,
      profiles (
        display_name,
        department
      ),
      external_crew (
        display_name,
        department
      )
    `)
    .eq("show_event_id", eventId);

  if (error) {
    console.error("Failed to load event crew:", error);
    setSelectedEventCrew([]);
    setLoadingEventCrew(false);
    return;
  }

  setSelectedEventCrew(data || []);
  setLoadingEventCrew(false);
  }
  if (!show) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading show...</p>
      </AppLayout>
    );
  }

  const isAdmin = profile?.role?.toLowerCase().includes("admin");

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Show Details
          </p>

          <h1 className="mt-2 text-4xl font-bold">{show.name}</h1>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Info
                label="Show Date & Time"
                value={
                  show.date_time
                    ? new Date(show.date_time).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not set"
                }
              />

              <Info label="Venue" value={show.venue || "Not set"} />
            </div>
          </div>
        </div>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div>
            <h2 className="text-xl font-semibold">Schedule</h2>

            <p className="mt-1 text-sm text-zinc-400">
              Events scheduled for this show
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {showEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No events have been added.
              </p>
            ) : (
            showEvents.map((event) => (
              <ShowScheduleEventCard
                key={event.id}
                event={event}
                onOpen={() => {setSelectedShowEvent(event), loadEventCrew(event.id)}}
                />
              ))
            )}
          </div>
        </section>
       
        {isAdmin && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">FOH Staffing</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {fohStaffing.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No FOH staff assigned.
                </p>
              ) : (
                fohStaffing.map((item: any) => (
                  <span
                    key={item.id || item.role_key}
                    className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium"
                  >
                    {item.role_label}: {item.staff_name || "Unassigned"}
                  </span>
                ))
              )}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Visiting Company</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info
              label="Arrival Time"
              value={show.arrival_time?.slice(0, 5) || "Not set"}
            />

            <Info
              label="Running Time"
              value={show.running_time || "Not set"}
            />

            <Info
              label="Contact Name"
              value={show.contact_name || "Not set"}
            />

            <Info
              label="Contact Role"
              value={show.contact_role || "Not set"}
            />

            <Info
              label="Phone Number"
              value={show.phone_number || "Not set"}
            />

            <Info
              label="Email Address"
              value={show.email_address || "Not set"}
            />

            <div className="md:col-span-2">
              <Info
                label="Company Vehicles"
                value={show.company_vehicles || "Not set"}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Notes</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-zinc-300">Lawn Seating</p>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded border ${
                    show.lawn_seating
                      ? "border-green-500 bg-green-500"
                      : "border-zinc-600 bg-zinc-900"
                  }`}
                >
                  {show.lawn_seating && (
                    <span className="text-sm font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-zinc-400">Notes</p>
              <p className="mt-2 rounded-xl bg-zinc-800 p-4 text-zinc-100">
                {show.notes || "No notes added."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Documents</h2>

          <div className="mt-5 space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No documents uploaded.
              </p>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-800 p-4"
                >
                  <span>{document.name}</span>

                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
                  >
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
        <ShowScheduleEventDialog
          event={selectedShowEvent}
          technicalCrew={selectedEventCrew}
          loadingCrew={loadingEventCrew}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedShowEvent(null);
              setSelectedEventCrew([]);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
function ShowScheduleEventCard({
  event,
  onOpen,
}: {
  event: any;
  onOpen: () => void;
}) {
  const eventType = (event.event_type || "Show") as EventType;
  const eventStyle = EVENT_TYPES[eventType] ?? EVENT_TYPES.Show;
  const patternClass = `event-pattern-${eventStyle.pattern}`;

  const start = event.start_time ? new Date(event.start_time) : null;
  const end = event.end_time ? new Date(event.end_time) : null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        event.cancelled
          ? "border-red-800 bg-red-950/40"
          : "border-zinc-700 bg-zinc-950/40"
      }`}
    >
      <div className="flex min-h-[128px]">
        <div
          className={`flex w-16 shrink-0 items-center justify-center border-r border-white/10 ${patternClass}`}
        >
          <span className="-rotate-90 whitespace-nowrap text-sm font-semibold text-white">
            {eventType}
          </span>
        </div>

        <div className="grid flex-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center">
  <div>
    <p
      className={`font-semibold ${
        event.cancelled
          ? "text-zinc-400 line-through"
          : "text-white"
      }`}
    >
      {event.title}
    </p>

    <p className="mt-1 text-sm text-zinc-500">
      {eventType}
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
      Date
    </p>

    <p className="mt-1 font-medium text-zinc-200">
      {start
        ? start.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not set"}
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
      Times
    </p>

    <p className="mt-1 font-medium text-zinc-200">
      {formatTimeRange(start, end)}
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
      Crew Call
    </p>

    <p className="mt-1 font-medium text-zinc-200">
      {event.crew_call?.slice(0, 5) || "Not set"}
    </p>
  </div>

  <div className="flex lg:justify-end">
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
    >
      More Details
    </button>
  </div>
</div>
      </div>
    </div>
  );
}
function ShowScheduleEventDialog({
  event,
  technicalCrew,
  loadingCrew,
  onOpenChange,
}: {
  event: any;
  technicalCrew: any[];
  loadingCrew: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const start = event?.start_time
    ? new Date(event.start_time)
    : null;

  const end = event?.end_time
    ? new Date(event.end_time)
    : null;

  return (
    <Dialog
      open={!!event}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-2xl">
        <DialogHeader>
          <p className="text-sm text-zinc-400">
            {event?.event_type || "Event"}
          </p>

          <DialogTitle className="text-2xl font-bold">
            {event?.title || "Event Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <EventDetail
            label="Start"
            value={formatDateTime(start)}
          />

          <EventDetail
            label="End"
            value={end ? formatDateTime(end) : "Not set"}
          />

          <EventDetail
            label="Crew Call"
            value={event?.crew_call?.slice(0, 5) || "Not set"}
          />

          <EventDetail
            label="Event Type"
            value={event?.event_type || "Not set"}
          />
        </div>

        <div className="mt-5">
          <p className="text-sm text-zinc-400">
            Technical Crew
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {loadingCrew ? (
              <p className="text-sm text-zinc-500">
                Loading technical crew...
              </p>
            ) : technicalCrew.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No technical crew assigned.
              </p>
            ) : (
              technicalCrew.map((member: any) => {
                const name =
                  member.profiles?.display_name ||
                  member.external_crew?.display_name ||
                  "Unknown";

                return (
                  <span
                    key={member.id}
                    className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium"
                  >
                    {name}
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-zinc-400">
            Notes
          </p>

          <p className="mt-2 min-h-24 whitespace-pre-wrap rounded-xl bg-zinc-800 p-4 text-zinc-100">
            {event?.notes || "No notes added."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function EventDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-800 p-4">
      <p className="text-sm text-zinc-400">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value}
      </p>
    </div>
  );
}

function formatTimeRange(
  start: Date | null,
  end: Date | null
) {
  if (!start) return "Not set";

  const startTime = start.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!end) return startTime;

  const endTime = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startTime} – ${endTime}`;
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not set";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-800 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}