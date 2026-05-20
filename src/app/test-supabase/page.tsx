"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [shows, setShows] = useState<any[]>([]);

  useEffect(() => {
    async function loadShows() {
      const { data, error } = await supabase
        .from("shows")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      setShows(data || []);
    }

    loadShows();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Supabase Test</h1>

      <pre className="mt-6 rounded-xl bg-zinc-900 p-4">
        {JSON.stringify(shows, null, 2)}
      </pre>
    </main>
  );
}