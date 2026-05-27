"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type VenueDocument = {
  id: number;
  name: string;
  file_url: string;
};

type Venue = {
  id: number;
  name: string;
  address: string | null;
  status: string | null;
  venue_documents: VenueDocument[];
};

export default function TechSpecsPage() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select(`
        id,
        name,
        address,
        status,
        venue_documents (
          id,
          name,
          file_url
        )
      `)
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setVenues(data || []);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Operations
          </p>

          <h1 className="mt-2 text-3xl font-bold">Tech Specs</h1>

          <p className="mt-2 text-zinc-400">
            Venue technical specification documents.
          </p>
        </div>

        <div className="grid gap-4">
          {venues.map((venue) => (
            <section
              key={venue.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <h2 className="text-xl font-bold text-white">{venue.name}</h2>

              <p className="mt-2 text-sm text-zinc-400">
                {venue.address || "No address listed"}
              </p>

              <div className="mt-5 space-y-3">
                {venue.venue_documents?.map((document) => (
                  <a
                    key={document.id}
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-indigo-500"
                  >
                    <span className="font-medium text-white">
                      {document.name}
                    </span>

                    <span className="text-sm text-indigo-300">
                      View PDF →
                    </span>
                  </a>
                ))}

                {venue.venue_documents?.length === 0 && (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    No tech spec documents uploaded yet.
                  </p>
                )}
              </div>
            </section>
          ))}

          {venues.length === 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
              No active venues found.
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}