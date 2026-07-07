"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

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

type ShowRow = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
  venue_id: number | null;
  cancelled: boolean | null;
  show_staff?: {
  assignment_type: string | null;
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

export default function TechnicalCrewAssignmentsReportPage() {
  const [shows, setShows] = useState<ShowRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [technicalUsers, setTechnicalUsers] = useState<TechnicalUser[]>([]);

  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [technicalUserFilter, setTechnicalUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const printParams = new URLSearchParams({
    search,
    venue: venueFilter,
    technicalUser: technicalUserFilter,
    dateFrom,
    dateTo,
  });

  const printUrl = `/admin/reports/technical-crew-assignments/print?${printParams.toString()}`;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: showsData, error: showsError } = await supabase
      .from("shows")
      .select(`
        id,
        name,
        date_time,
        venue,
        venue_id,
        cancelled,
        show_staff (
  assignment_type,
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
      .eq("cancelled", false)
      .order("date_time", { ascending: true });

    if (showsError) {
      console.error(
        "Load technical crew assignments failed:",
        JSON.stringify(showsError, null, 2)
      );
      alert(
        showsError.message ||
          "Failed to load technical crew assignments report."
      );
      return;
    }

    setShows((showsData || []) as unknown as ShowRow[]);

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

    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("id, display_name, department, disabled")
      .or("disabled.eq.false,disabled.is.null")
      .order("display_name", { ascending: true });

    if (usersError) {
      console.error(
        "Load technical users failed:",
        JSON.stringify(usersError, null, 2)
      );
      return;
    }

    const technicalOnly = (usersData || []).filter((user: TechnicalUser) =>
      user.department?.toLowerCase().includes("technical")
    );

    setTechnicalUsers(technicalOnly);
  }

 function getTechnicalCrew(show: ShowRow) {
  return (
    show.show_staff?.filter(
      (assignment) =>
        assignment.assignment_type === "technical" &&
        (assignment.profiles || assignment.external_crew)
    ) || []
  );
}

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const searchValue = search.toLowerCase();
      const technicalCrew = getTechnicalCrew(show);

      const matchesSearch =
        searchValue === "" ||
        show.name?.toLowerCase().includes(searchValue) ||
        show.venue?.toLowerCase().includes(searchValue) ||
        technicalCrew.some((assignment) => {
  const name =
    assignment.profiles?.display_name ||
    assignment.external_crew?.display_name ||
    "";

  return name.toLowerCase().includes(searchValue);
});

      const matchesVenue =
        venueFilter === "all" || String(show.venue_id) === venueFilter;

      const matchesTechnicalUser =
        technicalUserFilter === "all" ||
        technicalCrew.some(
          (assignment) =>
            assignment.profiles?.id === technicalUserFilter
        );

      const showDate = show.date_time ? new Date(show.date_time) : null;

      const matchesDateFrom =
        !dateFrom ||
        (showDate && showDate >= new Date(`${dateFrom}T00:00:00`));

      const matchesDateTo =
        !dateTo ||
        (showDate && showDate <= new Date(`${dateTo}T23:59:59`));

      return (
        matchesSearch &&
        matchesVenue &&
        matchesTechnicalUser &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [shows, search, venueFilter, technicalUserFilter, dateFrom, dateTo]);

  const selectedVenueName =
    venueFilter === "all"
      ? "All Venues"
      : venues.find((venue) => String(venue.id) === venueFilter)?.name ||
        "Selected Venue";

  const selectedTechnicalUserName =
    technicalUserFilter === "all"
      ? "All Technical Crew"
      : technicalUsers.find((user) => user.id === technicalUserFilter)
          ?.display_name || "Selected User";

  function resetFilters() {
    setSearch("");
    setVenueFilter("all");
    setTechnicalUserFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 print:hidden md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Admin Reports
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Technical Crew Assignments
            </h1>

            <p className="mt-2 text-zinc-400">
              Active shows with assigned technical crew.
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

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 print:hidden">
          <h2 className="text-xl font-semibold">Filters</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Venue
              </label>
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
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Technical Crew
              </label>
              <select
                value={technicalUserFilter}
                onChange={(event) =>
                  setTechnicalUserFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="all">All Technical Crew</option>

                {technicalUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || "Unnamed User"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Search
              </label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search show, venue, or crew..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
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
          <div className="mb-5 flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold">Report Results</h2>

            <p className="text-sm text-zinc-400">
              {filteredShows.length} result
              {filteredShows.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 print:border-zinc-300">
                  <th className="py-3 pr-4 font-semibold text-zinc-300 print:text-black">
                    Show
                  </th>
                  <th className="py-3 pr-4 font-semibold text-zinc-300 print:text-black">
                    Date
                  </th>
                  <th className="py-3 pr-4 font-semibold text-zinc-300 print:text-black">
                    Time
                  </th>
                  <th className="py-3 pr-4 font-semibold text-zinc-300 print:text-black">
                    Venue
                  </th>
                  <th className="py-3 pr-4 font-semibold text-zinc-300 print:text-black">
                    Technical Crew
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredShows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-zinc-500"
                    >
                      No shows found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredShows.map((show) => {
                    const technicalCrew = getTechnicalCrew(show);

                    return (
                      <tr
                        key={show.id}
                        className="border-b border-zinc-800 align-top print:border-zinc-200"
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

  const source = assignment.external_crew ? "External" : "User";

  return (
    <div key={index}>
      {name}{" "}
      <span className="text-xs text-zinc-500">
        ({source})
      </span>
    </div>
  );
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
        </section>
      </div>
    </AppLayout>
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