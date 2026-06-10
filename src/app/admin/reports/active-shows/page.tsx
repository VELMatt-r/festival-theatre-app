"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type ShowRow = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
  venue_id: number | null;
  cancelled: boolean | null;
};

type Venue = {
  id: number;
  name: string;
};

export default function ActiveShowsReportPage() {
  const [shows, setShows] = useState<ShowRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: showsData, error: showsError } = await supabase
      .from("shows")
      .select("id, name, date_time, venue, venue_id, cancelled")
      .eq("cancelled", false)
      .order("date_time", { ascending: true });

    if (showsError) {
      console.error("Load active shows report failed:", JSON.stringify(showsError, null, 2));
      alert(showsError.message || "Failed to load active shows report.");
      return;
    }

    setShows(showsData || []);

    const { data: venuesData, error: venuesError } = await supabase
      .from("venues")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (venuesError) {
      console.error("Load venues failed:", JSON.stringify(venuesError, null, 2));
      return;
    }

    setVenues(venuesData || []);
  }

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        show.name?.toLowerCase().includes(searchValue) ||
        show.venue?.toLowerCase().includes(searchValue);

      const matchesVenue =
        venueFilter === "all" || String(show.venue_id) === venueFilter;

      const showDate = show.date_time ? new Date(show.date_time) : null;

      const matchesDateFrom =
        !dateFrom ||
        (showDate && showDate >= new Date(`${dateFrom}T00:00:00`));

      const matchesDateTo =
        !dateTo ||
        (showDate && showDate <= new Date(`${dateTo}T23:59:59`));

      return matchesSearch && matchesVenue && matchesDateFrom && matchesDateTo;
    });
  }, [shows, search, venueFilter, dateFrom, dateTo]);

  const selectedVenueName =
    venueFilter === "all"
      ? "All Venues"
      : venues.find((venue) => String(venue.id) === venueFilter)?.name ||
        "Selected Venue";

  function resetFilters() {
    setSearch("");
    setVenueFilter("all");
    setDateFrom("");
    setDateTo("");
  }

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
              Shows currently marked as active, with date, time and venue.
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
              href="/admin/reports/active-shows/print"
                target="_blank"
                className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
                Print / Save PDF
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Filters</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Date From">
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </FilterField>

            <FilterField label="Date To">
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </FilterField>

            <FilterField label="Venue">
              <select
                value={venueFilter}
                onChange={(event) => setVenueFilter(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="all">All Venues</option>

                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search show or venue..."
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
              {filteredShows.length} show
              {filteredShows.length === 1 ? "" : "s"} found
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Results</h2>

            <p className="text-sm text-zinc-400">
              {filteredShows.length} result
              {filteredShows.length === 1 ? "" : "s"}
            </p>
          </div>

          <ReportTable shows={filteredShows} />
        </section>
      </div>

    </AppLayout>
  );
}

function ReportTable({
  shows,
  printMode = false,
}: {
  shows: ShowRow[];
  printMode?: boolean;
}) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-700 print:border-zinc-300">
            <th
              className={`py-3 pr-4 font-semibold ${
                printMode ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              Show
            </th>
            <th
              className={`py-3 pr-4 font-semibold ${
                printMode ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              Date
            </th>
            <th
              className={`py-3 pr-4 font-semibold ${
                printMode ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              Time
            </th>
            <th
              className={`py-3 pr-4 font-semibold ${
                printMode ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              Venue
            </th>
          </tr>
        </thead>

        <tbody>
          {shows.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-zinc-500">
                No active shows found for the selected filters.
              </td>
            </tr>
          ) : (
            shows.map((show) => (
              <tr
                key={show.id}
                className="border-b border-zinc-800 print:border-zinc-200"
              >
                <td className="py-3 pr-4 font-medium">
                  {show.name || "Untitled Show"}
                </td>
                <td className="py-3 pr-4">
                  {formatDate(show.date_time)}
                </td>
                <td className="py-3 pr-4">
                  {formatTime(show.date_time)}
                </td>
                <td className="py-3 pr-4">
                  {show.venue || "No venue"}
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

function PrintMeta({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
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