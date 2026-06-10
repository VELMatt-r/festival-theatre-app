"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ShowRow = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
  venue_id: number | null;
  cancelled: boolean | null;
};

export default function ActiveShowsPrintPage() {
  const [shows, setShows] = useState<ShowRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShows() {
      const { data, error } = await supabase
        .from("shows")
        .select("id, name, date_time, venue, venue_id, cancelled")
        .eq("cancelled", false)
        .order("date_time", { ascending: true });

      if (error) {
        console.error("Load active shows print report failed:", error);
        setLoading(false);
        return;
      }

      setShows(data || []);
      setLoading(false);
    }

    loadShows();
  }, []);

  if (loading) {
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
                Admin Report
              </p>

              <h1 className="mt-3 text-4xl font-black">Active Shows</h1>

              <p className="mt-2 text-zinc-300">
                Shows currently marked as active.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
              <PrintMeta
                label="Generated"
                value={new Date().toLocaleString("en-GB")}
              />
              <PrintMeta
                label="Results"
                value={`${shows.length} show${shows.length === 1 ? "" : "s"}`}
              />
            </div>
          </div>

          <div className="mt-8 h-1 w-full rounded-full bg-pink-500" />
        </header>

        <div className="space-y-8 px-10 py-8 print:px-8">
        <PrintSection title="Selected Filters">
        <PrintRow label="Date From" value="All dates" />
        <PrintRow label="Date To" value="All dates" />
        <PrintRow label="Venue" value="All venues" />
        <PrintRow label="Search" value="None" />
            </PrintSection>
          
          <PrintSection title="Report Results">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-300">
                    <th className="py-3 pr-4 font-semibold text-zinc-700">
                      Show
                    </th>
                    <th className="py-3 pr-4 font-semibold text-zinc-700">
                      Date
                    </th>
                    <th className="py-3 pr-4 font-semibold text-zinc-700">
                      Time
                    </th>
                    <th className="py-3 pr-4 font-semibold text-zinc-700">
                      Venue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {shows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-500">
                        No active shows found.
                      </td>
                    </tr>
                  ) : (
                    shows.map((show) => (
                      <tr key={show.id} className="border-b border-zinc-200">
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