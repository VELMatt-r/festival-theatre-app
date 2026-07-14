"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type Report = {
  id: number;
  show_name: string | null;
  show_event_id: number | null;
  report_form_key: string | null;
  venue_name: string | null;
  status: string | null;
  created_at: string | null;
  submitted_at: string | null;
  submitted_by_name: string | null;

  event: {
    title: string;
    start_time: string;
  } | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadReports();
  }, []);

 async function loadReports() {
  const { data: reportData, error: reportsError } =
    await supabase
      .from("show_reports")
      .select(`
        id,
        show_name,
        show_event_id,
        report_form_key,
        venue_name,
        status,
        created_at,
        submitted_at,
        submitted_by_name
      `)
      .order("created_at", { ascending: false });

  if (reportsError) {
    console.error(
      "Load reports failed:",
      JSON.stringify(reportsError, null, 2)
    );

    alert(
      reportsError.message || "Failed to load reports."
    );

    return;
  }

  const eventIds = [
    ...new Set(
      (reportData || [])
        .map((report) => report.show_event_id)
        .filter(
          (eventId): eventId is number =>
            typeof eventId === "number"
        )
    ),
  ];

  let eventMap = new Map<
    number,
    {
      title: string;
      start_time: string;
    }
  >();

  if (eventIds.length > 0) {
    const { data: eventData, error: eventsError } =
      await supabase
        .from("show_events")
        .select(`
          id,
          title,
          start_time
        `)
        .in("id", eventIds);

    if (eventsError) {
      console.error(
        "Load report events failed:",
        JSON.stringify(eventsError, null, 2)
      );
    } else {
      eventMap = new Map(
        (eventData || []).map((event) => [
          event.id,
          {
            title: event.title,
            start_time: event.start_time,
          },
        ])
      );
    }
  }

  const mappedReports: Report[] = (reportData || []).map(
    (report) => ({
      ...report,
      event: report.show_event_id
        ? eventMap.get(report.show_event_id) || null
        : null,
    })
  );

  setReports(mappedReports);
}

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.show_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        report.venue_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Reports
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Technical Show Reports
            </h1>

            <p className="mt-2 text-zinc-400">
              Draft and submitted technical show reports.
            </p>
          </div>

          <Link
            href="/reports/new"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            New Report
          </Link>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </section>

        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
              No reports found.
            </section>
          ) : (
            filteredReports.map((report) => (
  <div
    key={report.id}
    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500"
  >
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
  <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-xl font-bold">
        {report.show_name || "Untitled Show"}
      </h2>

      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          report.status?.toLowerCase() === "submitted"
            ? "bg-green-500/20 text-green-300"
            : "bg-yellow-500/20 text-yellow-300"
        }`}
      >
        {report.status?.toLowerCase() === "submitted"
          ? "Submitted"
          : "Draft"}
      </span>
    </div>

    <p className="mt-2 font-medium text-indigo-300">
      {report.event?.title || "Unknown Event"}
      {" — "}
      {getReportTypeLabel(report.report_form_key)}
    </p>

    <p className="mt-4 text-sm text-zinc-400">
      {report.venue_name || "No venue"}
    </p>

    <p className="mt-2 text-sm text-zinc-300">
      {report.event?.start_time
        ? new Date(
            report.event.start_time
          ).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Event date and time not set"}
    </p>

    {report.status?.toLowerCase() === "submitted" && (
  <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-400">
    <p>
      Submitted By:{" "}
      <span className="text-zinc-200">
        {report.submitted_by_name || "Unknown"}
      </span>
    </p>

    <p>
      Submitted:{" "}
      <span className="text-zinc-200">
        {report.submitted_at
          ? new Date(report.submitted_at).toLocaleString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "Unknown"}
      </span>
    </p>
  </div>
)}
  </div>

  <div className="flex shrink-0 flex-wrap gap-3">
    <Link
      href={`/reports/${report.id}`}
      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
    >
      Open Report
    </Link>

    <Link
      href={`/reports/${report.id}/print`}
      target="_blank"
      className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium transition hover:bg-zinc-700"
    >
      Print / Save PDF
    </Link>
  </div>
</div>
  </div>
))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function getReportTypeLabel(formKey: string | null) {
  switch (formKey) {
    case "technical-getin":
      return "Get-in Report";

    case "technical-rehearsal":
      return "Rehearsal Report";

    case "technical-show":
    default:
      return "Technical Show Report";
  }
}