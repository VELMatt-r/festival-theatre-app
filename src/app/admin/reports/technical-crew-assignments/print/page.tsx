"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: number;
  title: string | null;
  event_type: string | null;
  start_time: string | null;
  end_time: string | null;
  crew_call: string | null;
  cancelled: boolean | null;

  shows: {
    id: number;
    name: string | null;
    venue: string | null;
    venue_id: number | null;
    cancelled: boolean | null;
  } | null;

  show_event_staff?: {
    profiles: {
      id: string;
      display_name: string | null;
    } | null;

    external_crew: {
      id: number;
      display_name: string | null;
    } | null;
  }[];
};

type Venue = {
  id: number;
  name: string;
};

type TechnicalUser = {
  id: string;
  display_name: string | null;
  department: string | null;
  disabled: boolean | null;
};

export default function TechnicalCrewAssignmentsPrintPage() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const venueFilter = searchParams.get("venue") || "all";
  const technicalUserFilter = searchParams.get("technicalUser") || "all";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const [events, setEvents] = useState<EventRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [technicalUsers, setTechnicalUsers] = useState<TechnicalUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from("show_events")
        .select(`
          id,
          title,
          event_type,
          start_time,
          end_time,
          crew_call,
          cancelled,

        shows (
          id,
          name,
          venue,
          venue_id,
          cancelled
          ),

        show_event_staff (
          profiles (
            id,
            display_name
          ),
        external_crew (
          id,
          display_name
        )
      )
    `)
  .order("start_time", { ascending: true });

if (eventsError) {
  console.error(
    "Load technical crew assignments print report failed:",
    eventsError
  );

  setLoading(false);
  return;
}

const activeEvents = (eventsData || []).filter((event: any) => {
  return !event.cancelled && !event.shows?.cancelled;
});

setEvents(activeEvents as unknown as EventRow[]);

      const { data: venuesData, error: venuesError } = await supabase
        .from("venues")
        .select("id, name")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (!venuesError) {
        setVenues(venuesData || []);
      }

      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, display_name, department, disabled")
        .or("disabled.eq.false,disabled.is.null")
        .order("display_name", { ascending: true });

      if (!usersError) {
        const technicalOnly = (usersData || []).filter((user: TechnicalUser) =>
          user.department?.toLowerCase().includes("technical")
        );

        setTechnicalUsers(technicalOnly);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  function getTechnicalCrew(event: EventRow) {
  return (
    event.show_event_staff?.filter(
      (assignment) =>
        assignment.profiles || assignment.external_crew
    ) || []
  );
}

 const filteredEvents = useMemo(() => {
  return events.filter((event) => {
    const searchValue = search.toLowerCase();
    const technicalCrew = getTechnicalCrew(event);
    const show = event.shows;

    const matchesSearch =
      searchValue === "" ||
      event.title?.toLowerCase().includes(searchValue) ||
      event.event_type?.toLowerCase().includes(searchValue) ||
      show?.name?.toLowerCase().includes(searchValue) ||
      show?.venue?.toLowerCase().includes(searchValue) ||
      technicalCrew.some((assignment) => {
        const name =
          assignment.profiles?.display_name ||
          assignment.external_crew?.display_name ||
          "";

        return name.toLowerCase().includes(searchValue);
      });

    const matchesVenue =
      venueFilter === "all" ||
      String(show?.venue_id) === venueFilter;

    const matchesTechnicalUser =
      technicalUserFilter === "all" ||
      technicalCrew.some(
        (assignment) =>
          assignment.profiles?.id === technicalUserFilter
      );

    const eventDate = event.start_time
      ? new Date(event.start_time)
      : null;

    const matchesDateFrom =
      !dateFrom ||
      (eventDate &&
        eventDate >= new Date(`${dateFrom}T00:00:00`));

    const matchesDateTo =
      !dateTo ||
      (eventDate &&
        eventDate <= new Date(`${dateTo}T23:59:59`));

    return (
      matchesSearch &&
      matchesVenue &&
      matchesTechnicalUser &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
}, [
  events,
  search,
  venueFilter,
  technicalUserFilter,
  dateFrom,
  dateTo,
]);

  const totalAssignments = useMemo(() => {
  return filteredEvents.reduce((total, event) => {
    return total + getTechnicalCrew(event).length;
  }, 0);
}, [filteredEvents]);

  const selectedVenueName =
    venueFilter === "all"
      ? "All venues"
      : venues.find((venue) => String(venue.id) === venueFilter)?.name ||
        "Selected venue";

  const selectedTechnicalUserName =
    technicalUserFilter === "all"
      ? "All Technical Crew"
      : technicalUsers.find((user) => user.id === technicalUserFilter)
          ?.display_name || "Selected technical crew";

  if (loading) {
    return <main className="p-10">Loading report...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
        <header className="bg-zinc-950 px-10 py-8 text-white print:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Image
                src="/logo.png"
                alt="Festival Theatre"
                width={220}
                height={80}
                className="h-auto w-auto"
                priority
              />

              <p className="mt-8 text-sm uppercase tracking-[0.3em] text-pink-300">
                Admin Report
              </p>

              <h1 className="mt-3 text-4xl font-black">
                Technical Crew Assignments
              </h1>

              <p className="mt-2 text-zinc-300">
                Active Events and their assigned technical crew.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
              <PrintMeta
                label="Generated"
                value={new Date().toLocaleString("en-GB")}
              />
              <PrintMeta
               label="Events"
               value={`${filteredEvents.length} show${
                filteredEvents.length === 1 ? "" : "s"
               }`}
              />
              <PrintMeta
                label="Assignments"
                value={`${totalAssignments} assignment${
                  totalAssignments === 1 ? "" : "s"
                }`}
              />
            </div>
          </div>

          <div className="mt-8 h-1 w-full rounded-full bg-pink-500" />
        </header>

        <div className="space-y-8 px-10 py-8 print:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <PrintSection title="Selected Filters">
              <PrintRow label="Date From" value={dateFrom ? formatFilterDate(dateFrom) : "All dates"} />
              <PrintRow label="Date To" value={dateTo ? formatFilterDate(dateTo) : "All dates"} />
              <PrintRow label="Venue" value={selectedVenueName} />
              <PrintRow
                label="Technical Crew"
                value={selectedTechnicalUserName}
              />
              <PrintRow label="Search" value={search || "None"} />
            </PrintSection>

            <PrintSection title="Report Results">
              <div className="overflow-x-auto print:overflow-visible">
  <table className="w-full border-collapse text-left text-sm">
    <thead>
      <tr className="border-b border-zinc-300">
        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Show
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Event
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Date
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Time
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Crew Call
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Venue
        </th>

        <th className="py-3 pr-4 font-semibold text-zinc-700">
          Technical Crew
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredEvents.length === 0 ? (
        <tr>
          <td
            colSpan={7}
            className="py-6 text-center text-zinc-500"
          >
            No events found.
          </td>
        </tr>
      ) : (
        filteredEvents.map((event) => {
          const technicalCrew = getTechnicalCrew(event);
          const show = event.shows;

          return (
            <tr
              key={event.id}
              className="border-b border-zinc-200 align-top"
            >
              <td className="py-3 pr-4 font-medium">
                {show?.name || "Untitled Show"}
              </td>

              <td className="py-3 pr-4">
                <p className="font-medium">
                  {event.title || "Untitled Event"}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {event.event_type || "Show"}
                </p>
              </td>

              <td className="py-3 pr-4">
                {formatDate(event.start_time)}
              </td>

              <td className="py-3 pr-4">
                {formatTime(event.start_time)}
              </td>

              <td className="py-3 pr-4">
                {event.crew_call?.slice(0, 5) || "Not set"}
              </td>

              <td className="py-3 pr-4">
                {show?.venue || "No venue"}
              </td>

              <td className="py-3 pr-4">
                {technicalCrew.length === 0 ? (
                  <span className="text-zinc-500">
                    No technical crew assigned
                  </span>
                ) : (
                  <div className="space-y-1">
                    {technicalCrew.map((assignment, index) => {
                      const name =
                        assignment.profiles?.display_name ||
                        assignment.external_crew?.display_name ||
                        "Unknown";

                      return <div key={index}>{name}</div>;
                    })}
                  </div>
                )}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>
            </PrintSection>
          </div>

          <footer className="border-t border-zinc-200 pt-6 text-xs text-zinc-500">
            Festival Theatre Operational Report · Generated{" "}
            {new Date().toLocaleString("en-GB")}
          </footer>

          <div className="print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function PrintMeta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function PrintSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-5 border-b border-zinc-200 pb-3 text-sm font-black uppercase tracking-[0.2em] text-pink-600">
        {title}
      </h2>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PrintRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div className="grid gap-2 border-b border-zinc-100 pb-3 text-sm last:border-b-0 md:grid-cols-3">
      <div className="font-semibold text-zinc-600">{label}</div>
      <div className="whitespace-pre-wrap text-zinc-950 md:col-span-2">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
  if (!value) return "No time";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatFilterDate(value: string) {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}