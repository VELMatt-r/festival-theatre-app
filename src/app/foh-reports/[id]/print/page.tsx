"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PrintFOHReportPage() {
  const params = useParams();
  const reportId = Number(params.id);

  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadReport() {
      const { data, error } = await supabase
        .from("foh_reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setReport(data);
    }

    loadReport();
  }, [reportId]);

  if (!report) {
    return <main className="p-10">Loading report...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
        <header className="bg-zinc-950 px-10 py-8 text-white print:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Image src="/logo.png" alt="Festival Theatre" width={220} height={80} priority />

              <p className="mt-8 text-sm uppercase tracking-[0.3em] text-indigo-300">
                Front of House Report
              </p>

              <h1 className="mt-3 text-4xl font-black">
                {report.show_name || "Untitled Show"}
              </h1>

              <p className="mt-2 text-zinc-300">
                {report.venue_name || "No venue listed"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
              <PrintMeta label="Date" value={formatDate(report.performance_date)} />
              <PrintMeta label="Performance Time" value={report.performance_time} />
              <PrintMeta label="Status" value={report.status} />
            </div>
          </div>

          <div className="mt-8 h-1 w-full rounded-full bg-indigo-500" />
        </header>

        <div className="space-y-8 px-10 py-8 print:px-8">
          <PrintSection title="Show Information">
            <PrintRow label="Performance" value={report.show_name} />
            <PrintRow label="Date" value={formatDate(report.performance_date)} />
            <PrintRow label="Performance Time" value={report.performance_time} />
            <PrintRow label="Venue" value={report.venue_name} />
            <PrintRow label="Audience Number" value={report.house_audience_number} />
            <PrintRow label="Weather" value={report.weather} />
            <PrintRow label="Catering Provision" value={report.catering_provision} />
            <PrintRow label="Lavender Loos Cleaned" value={yesNo(report.lavender_loos_cleaned)} booleanValue={report.lavender_loos_cleaned} />
            <PrintRow label="Lavender Loo Notes" value={report.show_info_notes} />
          </PrintSection>

          <PrintSection title="Show Timings">
            <PrintRow label="House Open" value={report.house_open_time} />
            <PrintRow label="Curtain Up" value={report.curtain_up_time} />
            <PrintRow label="Interval Up" value={report.interval_up_time} />
            <PrintRow label="Interval Down" value={report.interval_down_time} />
            <PrintRow label="Curtain Down" value={report.curtain_down_time} />
          </PrintSection>

          <PrintSection title="Sound Meter Readings">
            <PrintRow label="Act 1 (Box Office)" value={report.act_1_box_office_sound} />
            <PrintRow label="Act 1 (Cottages)" value={report.act_1_cottages_sound} />
            <PrintRow label="Act 1 (Church)" value={report.act_1_church_sound} />
            <PrintRow label="Act 2 (Box Office)" value={report.act_2_box_office_sound} />
            <PrintRow label="Act 2 (Cottages)" value={report.act_2_cottages_sound} />
            <PrintRow label="Act 2 (Church)" value={report.act_2_church_sound} />
          </PrintSection>

          <PrintSection title="Staffing">
            {(report.staffing || []).map((staff: any, index: number) => (
              <div
                key={index}
                className="grid gap-2 border-b border-zinc-100 pb-3 text-sm last:border-b-0 md:grid-cols-3"
              >
                <div className="font-semibold text-zinc-600">{staff.role_label}</div>
                <div className="text-zinc-950">{staff.staff_name || "Unassigned"}</div>
                <div className="whitespace-pre-wrap text-zinc-500">{staff.notes || ""}</div>
              </div>
            ))}
          </PrintSection>

          <PrintSection title="Notes">
            <PrintRow label="General Audience Reaction" value={report.general_audience_reaction} />
            <PrintRow label="General Notes" value={report.general_notes} />
          </PrintSection>

          <PrintSection title="Submission">
            <PrintRow label="Status" value={report.status} />
            <PrintRow label="Submitted By" value={report.submitted_by_name || "Unknown"} />
            <PrintRow
              label="Submitted At"
              value={
                report.submitted_at
                  ? new Date(report.submitted_at).toLocaleString("en-GB")
                  : ""
              }
            />
          </PrintSection>

          <footer className="border-t border-zinc-200 pt-6 text-xs text-zinc-500">
            Festival Theatre FOH Report · Generated{" "}
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

function yesNo(value: boolean | null) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB");
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
      <h2 className="mb-5 border-b border-zinc-200 pb-3 text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
        {title}
      </h2>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PrintRow({
  label,
  value,
  booleanValue,
}: {
  label: string;
  value: string | null;
  booleanValue?: boolean | null;
}) {
  if (!value) return null;

  return (
    <div className="grid gap-2 border-b border-zinc-100 pb-3 text-sm last:border-b-0 md:grid-cols-3">
      <div className="font-semibold text-zinc-600">{label}</div>

      <div className="whitespace-pre-wrap text-zinc-950 md:col-span-2">
        {typeof booleanValue === "boolean" ? (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
              booleanValue
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}