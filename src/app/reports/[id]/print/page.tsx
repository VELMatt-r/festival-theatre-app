"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PrintReportPage() {
  const params = useParams();
  const reportId = Number(params.id);

  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadReport() {
      const { data, error } = await supabase
        .from("show_reports")
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
              <Image
                src="/logo.png"
                alt="Festival Theatre"
                width={220}
                height={80}
                className="h-auto w-auto"
                priority
              />

              <p className="mt-8 text-sm uppercase tracking-[0.3em] text-pink-300">
                Technical Show Report
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

          <div className="mt-8 h-1 w-full rounded-full bg-pink-500" />
        </header>

        <div className="space-y-8 px-10 py-8 print:px-8">
          <PrintSection title="Show Details">
            <PrintRow label="Show" value={report.show_name} />
            <PrintRow label="Date" value={formatDate(report.performance_date)} />
            <PrintRow label="Performance Time" value={report.performance_time} />
            <PrintRow label="Venue" value={report.venue_name} />
          </PrintSection>

          <PrintSection title="Opening Checks">
            <PrintRow
              label="Backstage Doors Unlocked"
              value={yesNo(report.backstage_doors_unlocked)}
              booleanValue={report.backstage_doors_unlocked}
            />
            <PrintRow
              label="Sides Opened"
              value={yesNo(report.sides_open)}
              booleanValue={report.sides_open}
            />

            {report.sides_open === false && (
              <PrintRow
                label="Reason For Sides Not Opened"
                value={report.sides_open_reason}
              />
            )}

            <PrintRow
              label="Any Damage To Structure"
              value={yesNo(report.structure_damage)}
              booleanValue={report.structure_damage}
            />

            {report.structure_damage === true && (
              <PrintRow
                label="Damage Detail"
                value={report.structure_damage_details}
              />
            )}

            <PrintRow label="Meter Reading" value={report.opening_meter_reading} />
            <PrintRow label="LX Working" value={yesNo(report.lx_working)} booleanValue={report.lx_working} />
            <PrintRow label="PA Working" value={yesNo(report.pa_working)} booleanValue={report.pa_working} />
            <PrintRow label="Dressing Rooms Set Up" value={yesNo(report.dressing_rooms_set_up)} booleanValue={report.dressing_rooms_set_up} />
            <PrintRow label="Additional Equipment On Site" value={yesNo(report.additional_equipment_on_site)} booleanValue={report.additional_equipment_on_site} />
            <PrintRow label="Comments" value={report.opening_comments} />
          </PrintSection>

          <PrintSection title="Show Timings & Notes">
            <PrintRow label="House Open" value={report.house_open_time} />
            <PrintRow label="Act 1 Clearance" value={report.act_1_clearance_time} />
            <PrintRow label="Act 1 Start" value={report.act_1_start_time} />
            <PrintRow label="Act 1 End" value={report.act_1_end_time} />
            <PrintRow label="Act 2 Clearance" value={report.act_2_clearance_time} />
            <PrintRow label="Act 2 Start" value={report.act_2_start_time} />
            <PrintRow label="Act 2 End" value={report.act_2_end_time} />
            <PrintRow label="Technical Issues (Venue)" value={report.technical_issues_venue} />
            <PrintRow label="Technical Issues (Company)" value={report.technical_issues_company} />
            <PrintRow label="FOH Issues" value={report.foh_issues} />
            <PrintRow label="H&S Incidents" value={report.health_safety_incidents} />
            <PrintRow label="General Comments" value={report.general_comments} />
            <PrintRow label="Additional Recharges" value={report.additional_recharges} />
          </PrintSection>

          <PrintSection title="Closing Checks">
            <PrintRow label="Sides Closed" value={yesNo(report.sides_closed)} booleanValue={report.sides_closed} />

            {report.sides_closed === false && (
              <>
                <PrintRow label="Reason For Sides Not Closed" value={report.sides_closed_reason} />
                <PrintRow label="Barriers In Place" value={yesNo(report.barriers_in_place)} booleanValue={report.barriers_in_place} />
              </>
            )}

            <PrintRow label="Any New Damage To Structure" value={yesNo(report.new_structure_damage)} booleanValue={report.new_structure_damage} />

            {report.new_structure_damage === true && (
              <PrintRow label="New Damage Details" value={report.new_structure_damage_details} />
            )}

            <PrintRow label="Closing Meter Reading" value={report.closing_meter_reading} />
            <PrintRow label="Bins Emptied" value={yesNo(report.bins_emptied)} booleanValue={report.bins_emptied} />
            <PrintRow label="Doors Locked" value={yesNo(report.doors_locked)} booleanValue={report.doors_locked} />
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
            Festival Theatre Operational Report · Generated{" "}
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