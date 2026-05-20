"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
useEffect(() => {
  async function loadShows() {
    const { data, error } = await supabase
  .from("shows")
  .select(`
    *,
    show_crew (
      crew (
        name
      )
    )
  `);

    const formattedEvents =
  data?.map((show) => ({
    title: show.name,
    start: show.date_time,

    extendedProps: {
      venue: show.venue,
      crewCall: show.crew_call,
      showId: show.id,
      crew:
        show.show_crew?.map(
          (assignment: any) => assignment.crew.name
        ) || [],
    },
  })) || [];
    setEvents(formattedEvents);
  }

  loadShows();
}, []);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Schedule
        </h1>

        <p className="text-zinc-400 mt-2">
          View and manage upcoming shows
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventClick={(info) => {
            setSelectedEvent(info.event);
          }}
        />
      </div>

      {/* Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">

            {/* Show Time */}
            <div>
              <p className="text-sm text-zinc-400">
                Show Time
              </p>

              <p className="mt-1 text-lg font-medium">
                {selectedEvent?.start?.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Venue */}
            <div>
              <p className="text-sm text-zinc-400">
                Venue
              </p>

              <p className="mt-1 text-lg font-medium">
                {selectedEvent?.extendedProps?.venue}
              </p>
            </div>

            {/* Crew Call */}
            <div>
              <p className="text-sm text-zinc-400">
                Crew Call
              </p>

              <p className="mt-1 text-lg font-medium">
                {selectedEvent?.extendedProps?.crewCall?.slice(0,5)}
              </p>
            </div>
            {/* Crew */}
<div>
  <p className="text-sm text-zinc-400 mb-3">
    Crew
  </p>

  <div className="flex flex-wrap gap-2">
    {selectedEvent?.extendedProps?.crew?.map(
      (member: string) => (
        <div
          key={member}
          className="
            rounded-full
            bg-zinc-800
            px-4
            py-2
            text-sm
            font-medium
          "
        >
          {member}
        </div>
      )
    )}
  </div>
</div>

            {/* More Details */}
            <Link
  href={`/shows/${selectedEvent?.extendedProps?.showId}`}
  className="block w-full rounded-xl bg-indigo-600 py-3 text-center font-medium transition hover:bg-indigo-500"
>
  More Details
</Link>

          </div>

        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}