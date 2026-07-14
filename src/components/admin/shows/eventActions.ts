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
  cancelled: boolean;
  notes: string | null;
  show_event_report_types:
    | {
        report_type_id: number;
      }[]
    | null;
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
      throw new Error(
        `The event "${event.title}" needs a start date and time.`
      );
    }

    return {
      show_id: showId,
      title: event.title.trim(),
      event_type: event.event_type,
      start_time: startTime,
      end_time: formatLocalDateTime(event.end_time),
      crew_call: event.crew_call || null,
      cancelled: event.cancelled,
      notes: event.notes.trim() || null,
    };
  });

  const { data: createdEvents, error } = await supabase
    .from("show_events")
    .insert(rows)
    .select("id");

  if (error) {
    console.error(
      "Create show events failed:",
      JSON.stringify(error, null, 2)
    );

    throw new Error(
      error.message || "Failed to create show events."
    );
  }

  if (!createdEvents || createdEvents.length !== events.length) {
    throw new Error(
      "The events were created, but their report assignments could not be matched."
    );
  }

  for (let index = 0; index < createdEvents.length; index += 1) {
    const createdEvent = createdEvents[index];
    const sourceEvent = events[index];

    await saveEventReportTypes(
      createdEvent.id,
      sourceEvent.report_type_ids
    );
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
      cancelled,
      notes,
      show_event_report_types (
        report_type_id
      )
    `)
    .eq("show_id", showId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error(
      "Load show events failed:",
      JSON.stringify(error, null, 2)
    );

    throw new Error(
      error.message || "Failed to load show events."
    );
  }

  return ((data || []) as unknown as ShowEventRow[]).map(
    mapRowToForm
  );
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

  const existingEvents = events.filter(
    (
      event
    ): event is ShowEventForm & {
      id: number;
    } => typeof event.id === "number"
  );

  const newEvents = events.filter(
    (event) => typeof event.id !== "number"
  );

  const { data: storedEvents, error: loadError } = await supabase
    .from("show_events")
    .select("id")
    .eq("show_id", showId);

  if (loadError) {
    console.error(
      "Load existing show events failed:",
      loadError
    );

    throw new Error(
      loadError.message ||
        "Failed to load existing show events."
    );
  }

  const retainedIds = new Set(
    existingEvents.map((event) => event.id)
  );

  const eventIdsToDelete =
    storedEvents
      ?.map((event) => event.id)
      .filter((eventId) => !retainedIds.has(eventId)) || [];

  // Only delete events removed by the user.
  if (eventIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("show_events")
      .delete()
      .eq("show_id", showId)
      .in("id", eventIdsToDelete);

    if (deleteError) {
      console.error(
        "Delete removed show events failed:",
        deleteError
      );

      throw new Error(
        deleteError.message ||
          "Failed to remove deleted show events."
      );
    }
  }

  // Update existing events while preserving their IDs.
  if (existingEvents.length > 0) {
    const updateRows = existingEvents.map((event) => {
      const startTime = formatLocalDateTime(
        event.start_time
      );

      if (!startTime) {
        throw new Error(
          `The event "${event.title}" needs a start date and time.`
        );
      }

      return {
        id: event.id,
        show_id: showId,
        title: event.title.trim(),
        event_type: event.event_type,
        start_time: startTime,
        end_time: formatLocalDateTime(event.end_time),
        crew_call: event.crew_call || null,
        cancelled: event.cancelled,
        notes: event.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };
    });

    const { error: updateError } = await supabase
      .from("show_events")
      .upsert(updateRows, {
        onConflict: "id",
      });

    if (updateError) {
      console.error(
        "Update show events failed:",
        updateError
      );

      throw new Error(
        updateError.message ||
          "Failed to update show events."
      );
    }

    for (const event of existingEvents) {
      await saveEventReportTypes(
        event.id,
        event.report_type_ids
      );
    }
  }

  // Insert newly added events and their report assignments.
  if (newEvents.length > 0) {
    await createShowEvents(showId, newEvents);
  }
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
    report_type_ids:
      row.show_event_report_types?.map(
        (assignment) => assignment.report_type_id
      ) || [],
    cancelled: row.cancelled,
    notes: row.notes || "",
  };
}

function formatLocalDateTime(date: Date | null) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

// =====================================================
// Report Type Assignments
// =====================================================

async function saveEventReportTypes(
  eventId: number,
  reportTypeIds: number[]
) {
  const { error: deleteError } = await supabase
    .from("show_event_report_types")
    .delete()
    .eq("show_event_id", eventId);

  if (deleteError) {
    console.error(
      "Delete event report types failed:",
      deleteError
    );

    throw new Error(
      deleteError.message ||
        "Failed to update event report types."
    );
  }

  if (reportTypeIds.length === 0) {
    return;
  }

  const uniqueReportTypeIds = [
    ...new Set(reportTypeIds),
  ];

  const rows = uniqueReportTypeIds.map(
    (reportTypeId) => ({
      show_event_id: eventId,
      report_type_id: reportTypeId,
    })
  );

  const { error: insertError } = await supabase
    .from("show_event_report_types")
    .insert(rows);

  if (insertError) {
    console.error(
      "Insert event report types failed:",
      insertError
    );

    throw new Error(
      insertError.message ||
        "Failed to save event report types."
    );
  }
}