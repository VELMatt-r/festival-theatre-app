"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type ReportType = {
  id: number;
  name: string;
  form_key: string;
};

type EventReportAssignment = {
  show_report_types: ReportType | null;
};

type Show = {
  id: number;
  name: string | null;
  venue: string | null;
  venue_id: number | null;
};

type ShowEvent = {
  id: number;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string | null;
  cancelled: boolean;
  shows: Show | null;
  show_event_report_types: EventReportAssignment[];
};

export default function NewShowReportPage() {
  const router = useRouter();

  const [events, setEvents] = useState<ShowEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedReportTypeId, setSelectedReportTypeId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from("show_events")
      .select(`
        id,
        title,
        event_type,
        start_time,
        end_time,
        cancelled,

        shows (
          id,
          name,
          venue,
          venue_id
        ),

        show_event_report_types (
          show_report_types (
            id,
            name,
            form_key
          )
        )
      `)
      .gte("start_time", yesterday.toISOString())
      .eq("cancelled", false)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Load report events failed:", error);
      setLoading(false);
      return;
    }

    setEvents((data || []) as unknown as ShowEvent[]);
    setLoading(false);
  }

  const selectedEvent =
    events.find(
      (event) => event.id === Number(selectedEventId)
    ) || null;

  const reportTypes: ReportType[] =
    selectedEvent?.show_event_report_types
      ?.map((assignment) => assignment.show_report_types)
      .filter(
        (reportType): reportType is ReportType =>
          reportType !== null
      ) || [];

  const selectedReportType =
    reportTypes.find(
      (reportType) =>
        reportType.id === Number(selectedReportTypeId)
    ) || null;

  function handleEventChange(eventId: string) {
    setSelectedEventId(eventId);
    setSelectedReportTypeId("");
  }

  async function createOrOpenReport() {
    if (!selectedEvent) {
      alert("Please select an event.");
      return;
    }

    if (!selectedReportType) {
      alert("Please select a report type.");
      return;
    }

    setCreating(true);

    const { data: existingReport, error: existingError } =
      await supabase
        .from("show_reports")
        .select("id")
        .eq("show_event_id", selectedEvent.id)
        .eq(
          "report_form_key",
          selectedReportType.form_key
        )
        .maybeSingle();

    if (existingError) {
      console.error(
        "Check existing report failed:",
        existingError
      );

      alert(
        existingError.message ||
          "Failed to check for an existing report."
      );

      setCreating(false);
      return;
    }

    if (existingReport) {
      router.push(`/reports/${existingReport.id}`);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const eventStart = new Date(selectedEvent.start_time);
    const show = selectedEvent.shows;

    const { data: createdReport, error: createError } =
      await supabase
        .from("show_reports")
        .insert({
          show_id: show?.id || null,
          show_event_id: selectedEvent.id,

          venue_id: show?.venue_id || null,
          venue_name: show?.venue || null,

          show_name:
            show?.name || selectedEvent.title || "Untitled",

          performance_date: formatLocalDate(eventStart),
          performance_time: formatLocalTime(eventStart),

          report_form_key: selectedReportType.form_key,

          status: "draft",
          created_by: user?.id || null,
        })
        .select("id")
        .single();

    if (createError) {
      console.error(
        "Create event report failed:",
        createError
      );

      alert(
        createError.message ||
          "Failed to create report draft."
      );

      setCreating(false);
      return;
    }

    router.push(`/reports/${createdReport.id}`);
  }

  const eventDate = selectedEvent
    ? new Date(selectedEvent.start_time).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "";

  const eventTime = selectedEvent
    ? new Date(selectedEvent.start_time).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Reports
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            New Report
          </h1>

          <p className="mt-2 text-zinc-400">
            Create or continue a report for a scheduled
            event.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          {loading ? (
            <p className="text-zinc-400">
              Loading events...
            </p>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Event
                </label>

                <select
                  value={selectedEventId}
                  onChange={(event) =>
                    handleEventChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                >
                  <option value="">Select Event</option>

                  {events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.title} —{" "}
                      {event.shows?.name || "No parent show"} —{" "}
                      {new Date(
                        event.start_time
                      ).toLocaleDateString("en-GB")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Parent Show"
                      value={
                        selectedEvent.shows?.name || ""
                      }
                    />

                    <ReadOnlyField
                      label="Event Type"
                      value={selectedEvent.event_type}
                    />

                    <ReadOnlyField
                      label="Venue"
                      value={
                        selectedEvent.shows?.venue || ""
                      }
                    />

                    <ReadOnlyField
                      label="Date"
                      value={eventDate}
                    />

                    <ReadOnlyField
                      label="Time"
                      value={eventTime}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">
                      Report Type
                    </label>

                    {reportTypes.length === 0 ? (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-200">
                        No report types are assigned to this
                        event.
                      </div>
                    ) : (
                      <select
                        value={selectedReportTypeId}
                        onChange={(event) =>
                          setSelectedReportTypeId(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
                      >
                        <option value="">
                          Select Report Type
                        </option>

                        {reportTypes.map((reportType) => (
                          <option
                            key={reportType.id}
                            value={reportType.id}
                          >
                            {reportType.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={createOrOpenReport}
                      disabled={
                        !selectedReportType || creating
                      }
                      className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {creating
                        ? "Opening Report..."
                        : "Create / Open Report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(
    2,
    "0"
  );

  return `${hours}:${minutes}`;
}