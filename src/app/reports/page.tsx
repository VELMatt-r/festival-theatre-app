"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type Report = {
  id: number;
  show_name: string | null;
  venue_name: string | null;
  performance_date: string | null;
  performance_time: string | null;
  status: string | null;
  created_at: string | null;
  submitted_at: string | null;
  submitted_by_name: string | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const { data, error } = await supabase
      .from("show_reports")
      .select(`
        id,
        show_name,
        venue_name,
        performance_date,
        performance_time,
        status,
        created_at,
        submitted_at,
        submitted_by_name
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load reports failed:", JSON.stringify(error, null, 2));
alert(error.message || "Failed to load reports.");
      return;
    }

    setReports(data || []);
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
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">
            {report.show_name || "Untitled Show"}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              report.status === "submitted"
                ? "bg-green-500/20 text-green-300"
                : "bg-yellow-500/20 text-yellow-300"
            }`}
          >
            {report.status}
          </span>
        </div>

        <p className="mt-2 text-zinc-400">
          {report.venue_name}
        </p>

        <div className="mt-1 text-sm text-zinc-500">
  <p>
    {report.performance_date
      ? new Date(report.performance_date).toLocaleDateString("en-GB")
      : "No Date"}{" "}
    · {report.performance_time}
  </p>

  {report.status === "submitted" && report.submitted_at && (
    <p className="mt-2 text-xs text-zinc-500">
      Submitted by {report.submitted_by_name || "Unknown"} ·{" "}
      {new Date(report.submitted_at).toLocaleString("en-GB")}
    </p>
  )}
</div>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href={`/reports/${report.id}`}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-300 transition hover:bg-zinc-700"
        >
          Open Report
        </Link>

        <Link
          href={`/reports/${report.id}/print`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
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