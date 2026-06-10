"use client";

import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

const reports = [
  {
    title: "Active Shows",
    description:
      "View all active shows with dates, times and venues.",
    href: "/admin/reports/active-shows",
    status: "Available",
  },
  {
    title: "Technical Crew Assignments",
    description:
      "View technical crew assigned to upcoming shows.",
    href: "/admin/reports/technical-crew-assignments",
    status: "Available",
  },
  {
    title: "FOH Staffing",
    description:
      "View FOH staffing assignments across shows.",
    href: "#",
    status: "Coming Soon",
  },
  {
    title: "Technical Reports",
    description:
      "View and analyse submitted technical reports.",
    href: "#",
    status: "Coming Soon",
  },
  {
    title: "FOH Reports",
    description:
      "View and analyse submitted FOH reports.",
    href: "#",
    status: "Coming Soon",
  },
  {
    title: "Documents",
    description:
      "View document uploads and activity.",
    href: "#",
    status: "Coming Soon",
  },
];

export default function AdminReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Reports
          </h1>

          <p className="mt-2 text-zinc-400">
            Generate operational and management reports.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">
                  {report.title}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    report.status === "Available"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                {report.description}
              </p>

              {report.status === "Available" ? (
                <Link
                  href={report.href}
                  className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
                >
                  Open Report
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-5 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}