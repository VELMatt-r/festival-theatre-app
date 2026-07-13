import { supabase } from "@/lib/supabase";

import type { ShowEventForm } from "./types";

// =====================================================
// Types
// =====================================================

type ShowEventRow = {
  id: number;
  show_id: number;
  title: string;
  event_type: ShowEventForm["event_type"];
  start_time: string;
  end_time: string | null;
  crew_call: string | null;
  report_type: ShowEventForm["report_type"];
  cancelled: boolean;
  notes: string | null;
};

// =====================================================
// Create
// =====================================================

export async function createShowEvents(
  showId: number,
  events: ShowEventForm[]
) {
  if (events.length === 0) {
    throw new Error("A show must have at least one event.");
  }

const rows = events.map((event) => {
  const startTime = formatLocalDateTime(event.start_time);

  if (!startTime) {
    throw new Error(`The event "${event.title}" needs a start date and time.`);
  }

  return {
    show_id: showId,
    title: event.title.trim(),
    event_type: event.event_type,
    start_time: startTime,
    end_time: formatLocalDateTime(event.end_time),
    crew_call: event.crew_call || null,
    report_type: event.report_type,
    cancelled: event.cancelled,
    notes: event.notes.trim() || null,
  };
});

  const { error } = await supabase
    .from("show_events")
    .insert(rows);

  if (error) {
    console.error(
      "Create show events failed:",
      JSON.stringify(error, null, 2)
    );

    throw new Error(error.message || "Failed to create show events.");
  }
}

// =====================================================
// Load
// =====================================================

export async function loadShowEvents(
  showId: number
): Promise<ShowEventForm[]> {
  const { data, error } = await supabase
    .from("show_events")
    .select(`
      id,
      show_id,
      title,
      event_type,
      start_time,
      end_time,
      crew_call,
      report_type,
      cancelled,
      notes
    `)
    .eq("show_id", showId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error(
      "Load show events failed:",
      JSON.stringify(error, null, 2)
    );

    throw new Error(error.message || "Failed to load show events.");
  }

  return ((data || []) as ShowEventRow[]).map(mapRowToForm);
}

// =====================================================
// Replace Existing Events
// =====================================================

export async function replaceShowEvents(
  showId: number,
  events: ShowEventForm[]
) {
  if (events.length === 0) {
    throw new Error("A show must have at least one event.");
  }

  const { error: deleteError } = await supabase
    .from("show_events")
    .delete()
    .eq("show_id", showId);

  if (deleteError) {
    console.error(
      "Delete existing show events failed:",
      JSON.stringify(deleteError, null, 2)
    );

    throw new Error(
      deleteError.message || "Failed to update show events."
    );
  }

  await createShowEvents(showId, events);
}

// =====================================================
// Mapping Helpers
// =====================================================

function mapRowToForm(row: ShowEventRow): ShowEventForm {
  return {
    id: row.id,
    title: row.title || "",
    event_type: row.event_type,
    start_time: row.start_time
      ? new Date(row.start_time)
      : null,
    end_time: row.end_time
      ? new Date(row.end_time)
      : null,
    crew_call: row.crew_call || "",
    report_type: row.report_type,
    cancelled: row.cancelled,
    notes: row.notes || "",
  };
}

function formatLocalDateTime(date: Date | null) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}