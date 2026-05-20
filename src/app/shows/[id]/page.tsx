"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

export default function ShowDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [show, setShow] = useState<any>(null);
  const [crew, setCrew] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function loadShow() {
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setShow(data);
      const { data: crewData, error: crewError } =
  await supabase
    .from("show_crew")
    .select(`
      crew (
        name
      )
    `)
    .eq("show_id", id);

if (crewError) {
  console.error(crewError);
  return;
}

setCrew(crewData || []);

const { data: documentData, error: documentError } = await supabase
  .from("documents")
  .select("*")
  .eq("show_id", id);

if (documentError) {
  console.error(documentError);
  return;
}

setDocuments(documentData || []);
    }

    loadShow();
  }, [id]);

  if (!show) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading show...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Show Details
          </p>

          <h1 className="mt-2 text-4xl font-bold">{show.name}</h1>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Info label="Show Date & Time" value={new Date(show.date_time).toLocaleString("en-GB",{
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} 
              />
              <Info label="Venue" value={show.venue} />
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Crew</h2>

          <div className="mt-5">
            <p className="text-sm text-zinc-400">Crew Call</p>
            <p className="mt-1 text-lg font-semibold">{show.crew_call}</p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm text-zinc-400">Crew Names</p>

            <div className="flex flex-wrap gap-2">
             {crew.map((member: any, index: number) => (
  <span
    key={index}
    className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium"
  >
    {member.crew.name}
  </span>
))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Visiting Company</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
  <Info
    label="Arrival Time"
    value={show.arrival_time?.slice(0, 5) || "Not set"}
  />

  <Info
    label="Running Time"
    value={show.running_time || "Not set"}
  />

  <Info
    label="Contact Name"
    value={show.contact_name || "Not set"}
  />

  <Info
    label="Contact Role"
    value={show.contact_role || "Not set"}
  />

  <Info
    label="Phone Number"
    value={show.phone_number || "Not set"}
  />

  <Info
    label="Email Address"
    value={show.email_address || "Not set"}
  />

  <div className="md:col-span-2">
    <Info
      label="Company Vehicles"
      value={show.company_vehicles || "Not set"}
    />
  </div>
</div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Notes</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
         <div className="rounded-xl bg-zinc-800 p-4">
  <div className="flex items-center gap-3">
    <p className="text-sm text-zinc-300">
      Lawn Seating
    </p>

    <div
      className={`
        flex h-6 w-6 items-center justify-center rounded border
        ${
          show.lawn_seating
            ? "border-green-500 bg-green-500"
            : "border-zinc-600 bg-zinc-900"
        }
      `}
    >
      {show.lawn_seating && (
        <span className="text-sm font-bold text-white">
          ✓
        </span>
      )}
    </div>
  </div>
</div>

            <div className="md:col-span-2">
              <p className="text-sm text-zinc-400">Notes</p>
              <p className="mt-2 rounded-xl bg-zinc-800 p-4 text-zinc-100">
                {show.notes || "No notes added."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Documents</h2>

          <div className="mt-5 space-y-3">
           {documents.map((document) => (
  <div
    key={document.id}
    className="flex items-center justify-between rounded-xl bg-zinc-800 p-4"
  >
    <span>{document.name}</span>

    <a
      href={document.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
    >
      View
    </a>
  </div>
))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-800 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}