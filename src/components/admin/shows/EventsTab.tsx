"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { TabsContent } from "@/components/ui/tabs";

import EventCard from "./EventCard";
import EventDialog from "./EventDialog";

import type { ShowEventForm, ShowReportType } from "./types";

type EventsTabProps = {
  events: ShowEventForm[];
  setEvents: React.Dispatch<React.SetStateAction<ShowEventForm[]>>;
  parentDate: Date | null;
};

export default function EventsTab({
  events,
  setEvents,
  parentDate,
}: EventsTabProps) {
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(
    null
  );

  const [reportTypes, setReportTypes] = useState<ShowReportType[]>([]);

  useEffect(() => {
  loadReportTypes();
}, []);

async function loadReportTypes() {
  const { data, error } = await supabase
    .from("show_report_types")
    .select(`
      id,
      name,
      description,
      report_category,
      form_key,
      active,
      sort_order
    `)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load report types:", error);
    return;
  }

  setReportTypes(data || []);
}

  const editingEvent =
    editingEventIndex !== null ? events[editingEventIndex] : null;

  function openAddEventDialog() {
    setEditingEventIndex(null);
    setEventDialogOpen(true);
  }

  function openEditEventDialog(index: number) {
    setEditingEventIndex(index);
    setEventDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setEventDialogOpen(open);

    if (!open) {
      setEditingEventIndex(null);
    }
  }

  function saveEvent(event: ShowEventForm) {
    if (editingEventIndex !== null) {
      setEvents((current) =>
        current.map((existingEvent, index) =>
          index === editingEventIndex
            ? event
            : existingEvent
        )
      );

      return;
    }

    setEvents((current) => [...current, event]);
  }

  function deleteEvent(index: number) {
    const event = events[index];

    const confirmed = window.confirm(
      `Delete the event "${event.title}"?`
    );

    if (!confirmed) return;

    setEvents((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  return (
    <TabsContent value="events" className="mt-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Events</h2>

          <p className="mt-1 text-sm text-zinc-400">
            Add every scheduled event connected to this show.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddEventDialog}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-500"
        >
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <EmptyEventsState onAddEvent={openAddEventDialog} />
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <EventCard
              key={event.id ?? `${event.event_type}-${index}`}
              event={event}
              onEdit={() => openEditEventDialog(index)}
              onDelete={() => deleteEvent(index)}
            />
          ))}
        </div>
      )}

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={handleDialogOpenChange}
        event={editingEvent}
        onSave={saveEvent}
        parentDate={parentDate}
        reportTypes={reportTypes}
      />
    </TabsContent>
  );
}

function EmptyEventsState({
  onAddEvent,
}: {
  onAddEvent: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 p-8 text-center">
      <p className="font-medium text-zinc-200">
        No events have been added
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        A show must have at least one event before it can be saved.
      </p>

      <button
        type="button"
        onClick={onAddEvent}
        className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-500"
      >
        Add First Event
      </button>
    </div>
  );
}