"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type ShowEventRow = {
  id: number;
  title: string | null;
  event_type: string;
  start_time: string | null;
  cancelled: boolean | null;

  shows: {
    id: number;
    venue: string | null;
    venue_id: number | null;
    cancelled: boolean | null;
  } | null;
};

type Venue = {
  id: number;
  name: string;
};

export default function ActiveShowsReportPage() {
  const [events, setEvents] = useState<ShowEventRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: eventsData, error: eventsError } = await supabase
      .from("show_events")
      .select(`
        id,
        title,
        event_type,
        start_time,
        cancelled,
        shows (
          id,
          venue,
          venue_id,
          cancelled
        )
      `)
      .eq("event_type", "Show")
      .eq("cancelled", false)
      .order("start_time", { ascending: true });

    if (eventsError) {
      console.error(
        "Load active shows report failed:",
        JSON.stringify(eventsError, null, 2)
      );

      alert(
        eventsError.message ||
          "Failed to load active shows report."
      );

      return;
    }

    const activeEvents = (eventsData || []).filter(
      (event: any) => !event.shows?.cancelled
    );

    setEvents(activeEvents as unknown as ShowEventRow[]);

    const { data: venuesData, error: venuesError } = await supabase
      .from("venues")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (venuesError) {
      console.error(
        "Load venues failed:",
        JSON.stringify(venuesError, null, 2)
      );

      return;
    }

    setVenues(venuesData || []);
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchValue = search.toLowerCase();
      const show = event.shows;

      const matchesSearch =
        searchValue === "" ||
        event.title?.toLowerCase().includes(searchValue) ||
        show?.venue?.toLowerCase().includes(searchValue);

      const matchesVenue =
        venueFilter === "all" ||
        String(show?.venue_id) === venueFilter;

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
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    events,
    search,
    venueFilter,
    dateFrom,
    dateTo,
  ]);

  function resetFilters() {
    setSearch("");
    setVenueFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const printParams = new URLSearchParams();

  if (search) {
    printParams.set("search", search);
  }

  if (venueFilter !== "all") {
    printParams.set("venue", venueFilter);
  }

  if (dateFrom) {
    printParams.set("dateFrom", dateFrom);
  }

  if (dateTo) {
    printParams.set("dateTo", dateTo);
  }

  const printUrl = `/admin/reports/active-shows/print${
    printParams.toString()
      ? `?${printParams.toString()}`
      : ""
  }`;

  return (
    <AppLayout>
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Admin Reports
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Active Shows
            </h1>

            <p className="mt-2 text-zinc-400">
              Active show events with date, time and venue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/reports"
              className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
            >
              Back to Reports
            </Link>

            <Link
              href={printUrl}
              target="_blank"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Print / Save PDF
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">
            Filters
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Date From">
              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </FilterField>

            <FilterField label="Date To">
              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </FilterField>

            <FilterField label="Venue">
              <select
                value={venueFilter}
                onChange={(event) =>
                  setVenueFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="all">
                  All Venues
                </option>

                {venues.map((venue) => (
                  <option
                    key={venue.id}
                    value={venue.id}
                  >
                    {venue.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Search">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search event or venue..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </FilterField>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
            >
              Reset Filters
            </button>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm text-zinc-400">
              {filteredEvents.length} show
              {filteredEvents.length === 1 ? "" : "s"} found
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Report Results
            </h2>

            <p className="text-sm text-zinc-400">
              {filteredEvents.length} result
              {filteredEvents.length === 1 ? "" : "s"}
            </p>
          </div>

          <ReportTable events={filteredEvents} />
        </section>
      </div>
    </AppLayout>
  );
}

function ReportTable({
  events,
}: {
  events: ShowEventRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="py-3 pr-4 font-semibold text-zinc-300">
              Event Title
            </th>

            <th className="py-3 pr-4 font-semibold text-zinc-300">
              Date
            </th>

            <th className="py-3 pr-4 font-semibold text-zinc-300">
              Time
            </th>

            <th className="py-3 pr-4 font-semibold text-zinc-300">
              Venue
            </th>
          </tr>
        </thead>

        <tbody>
          {events.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-6 text-center text-zinc-500"
              >
                No active shows found for the selected filters.
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-zinc-800"
              >
                <td className="py-3 pr-4 font-medium">
                  {event.title || "Untitled Event"}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(event.start_time)}
                </td>

                <td className="py-3 pr-4">
                  {formatTime(event.start_time)}
                </td>

                <td className="py-3 pr-4">
                  {event.shows?.venue || "No venue"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      {children}
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