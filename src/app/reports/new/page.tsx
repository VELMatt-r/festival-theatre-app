"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Show = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
  venue_id: number | null;
};

type Venue = {
  id: number;
  name: string;
  requires_opening_checks: boolean;
};

type CrewMember = {
  id: number;
  name: string;
  role: string | null;
  department: string | null;
  status: string | null;
};

export default function NewShowReportPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const router = useRouter();

  const [selectedShowId, setSelectedShowId] = useState("");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const [dutyTechnicianId, setDutyTechnicianId] = useState("");
  const [dutyManagerId, setDutyManagerId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [showsResult, venuesResult, crewResult] = await Promise.all([
      supabase
        .from("shows")
        .select("id, name, date_time, venue, venue_id")
        .order("date_time", { ascending: false }),

      supabase
        .from("venues")
        .select("id, name, requires_opening_checks"),

      supabase
        .from("profiles")
        .select("id, name, role, department, status")
        .eq("status", "active")
        .order("name"),
    ]);

    if (showsResult.error) console.error(showsResult.error);
    if (venuesResult.error) console.error(venuesResult.error);
    if (crewResult.error) console.error(crewResult.error);

    setShows(showsResult.data || []);
    setVenues(venuesResult.data || []);
    setCrew(crewResult.data || []);
  }

  function handleShowChange(showId: string) {
    setSelectedShowId(showId);

    const show = shows.find((item) => item.id === Number(showId)) || null;
    setSelectedShow(show);

    const venue =
      venues.find((item) => item.id === show?.venue_id) || null;

    setSelectedVenue(venue);
  }

  async function saveDraft() {
    if (!selectedShow) {
      alert("Please select a show.");
      return;
    }

    const performanceDate = selectedShow.date_time
      ? new Date(selectedShow.date_time).toISOString().split("T")[0]
      : null;

    const performanceTime = selectedShow.date_time
      ? new Date(selectedShow.date_time).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
  .from("show_reports")
  .insert([
    {
      show_id: selectedShow.id,
      venue_id: selectedShow.venue_id,
      venue_name: selectedShow.venue,
      show_name: selectedShow.name,
      performance_date: performanceDate,
      performance_time: performanceTime,
      duty_technician_id: dutyTechnicianId
        ? Number(dutyTechnicianId)
        : null,
      duty_manager_id: dutyManagerId
        ? Number(dutyManagerId)
        : null,
      status: "draft",
      created_by: user?.id || null,
    },
  ])
  .select()
  .single();

    if (error) {
      console.error(error);
      alert("Failed to save report draft.");
      return;
    }

    router.push(`/reports/${data.id}`);alert("Report draft created.");
  }

  const technicalCrew = crew.filter(
    (member) =>
      member.department?.toLowerCase() === "technical"
  );

  const dutyManagers = crew.filter((member) =>
    member.role?.toLowerCase().includes("house manager")
  );

  const showDate = selectedShow?.date_time
    ? new Date(selectedShow.date_time).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const showTime = selectedShow?.date_time
    ? new Date(selectedShow.date_time).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Reports
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            New Show Report
          </h1>

          <p className="mt-2 text-zinc-400">
            Create a report draft for a show.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-zinc-400">
                Show
              </label>

              <select
                value={selectedShowId}
                onChange={(event) =>
                  handleShowChange(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="">Select Show</option>

                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.name}{" "}
                    {show.date_time
                      ? `- ${new Date(show.date_time).toLocaleDateString(
                          "en-GB"
                        )}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <ReadOnlyField label="Venue" value={selectedShow?.venue || ""} />
            <ReadOnlyField label="Date" value={showDate} />
            <ReadOnlyField label="Performance Time" value={showTime} />

            <ReadOnlyField
              label="Opening Checks"
              value={
                selectedVenue?.requires_opening_checks
                  ? "Required"
                  : "Not required"
              }
            />

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Duty Technician
              </label>

              <select
                value={dutyTechnicianId}
                onChange={(event) =>
                  setDutyTechnicianId(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="">Select Duty Technician</option>

                {technicalCrew.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Duty Manager
              </label>

              <select
                value={dutyManagerId}
                onChange={(event) =>
                  setDutyManagerId(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="">Select Duty Manager</option>

                {dutyManagers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Create Draft Report
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <div className="min-h-[50px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
        {value || "—"}
      </div>
    </div>
  );
}