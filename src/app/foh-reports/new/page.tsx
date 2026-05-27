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

type StaffingAssignment = {
  role_key: string;
  role_label: string;
  staff_name: string | null;
  notes: string | null;
};

export default function NewFOHReportPage() {
  const router = useRouter();

  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState("");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [staffing, setStaffing] = useState<StaffingAssignment[]>([]);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    const { data, error } = await supabase
      .from("shows")
      .select("id, name, date_time, venue, venue_id")
      .order("date_time", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load shows.");
      return;
    }

    setShows(data || []);
  }

  async function handleShowChange(showId: string) {
    setSelectedShowId(showId);

    const show = shows.find((item) => item.id === Number(showId)) || null;
    setSelectedShow(show);

    if (!show) {
      setStaffing([]);
      return;
    }

    const { data, error } = await supabase
      .from("show_foh_staffing")
      .select("role_key, role_label, staff_name, notes")
      .eq("show_id", show.id)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setStaffing([]);
      return;
    }

    setStaffing(data || []);
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
      .from("foh_reports")
      .insert([
        {
          show_id: selectedShow.id,
          show_name: selectedShow.name,
          venue_name: selectedShow.venue,
          performance_date: performanceDate,
          performance_time: performanceTime,
          status: "draft",
          staffing,
          submitted_by: null,
          submitted_by_name: null,
          submitted_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create FOH report failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to create FOH report draft.");
      return;
    }

    router.push(`/foh-reports/${data.id}`);
  }

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
            Front of House
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            New FOH Report
          </h1>

          <p className="mt-2 text-zinc-400">
            Create a Front of House report draft for a show.
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

            <div className="md:col-span-2">
              <h2 className="mt-4 text-xl font-semibold text-white">
                FOH Staffing
              </h2>

              <div className="mt-4 space-y-3">
                {staffing.length === 0 ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                    No FOH staffing assignments found for this show.
                  </p>
                ) : (
                  staffing.map((item, index) => (
                    <div
                      key={`${item.role_label}-${index}`}
                      className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-400">
                          Role
                        </p>
                        <p className="font-medium text-white">
                          {item.role_label}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400">
                          Staff Member
                        </p>
                        <p className="font-medium text-white">
                          {item.staff_name || "Unassigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400">
                          Notes
                        </p>
                        <p className="font-medium text-white">
                          {item.notes || "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Create Draft FOH Report
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