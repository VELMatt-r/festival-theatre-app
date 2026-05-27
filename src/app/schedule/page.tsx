"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase";

type StaffMember = {
  name: string;
  department: string | null;
  assignmentType: string;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, department")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
    }

    const { data, error } = await supabase
      .from("shows")
      .select(`
        *,
        show_staff (
          assignment_type,
          profiles (
            display_name,
            department
          )
        ),
        show_foh_staffing (
          role_label,
          staff_name,
          notes
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const formattedEvents =
      data?.map((show) => {
        const technicalStaff =
          show.show_staff
            ?.filter(
              (assignment: any) =>
                assignment.assignment_type === "technical"
            )
            .map((assignment: any) => ({
              name:
                assignment.profiles?.display_name || "Unknown",
              department:
                assignment.profiles?.department || "Technical",
              assignmentType: "technical",
            })) || [];

        const fohStaff =
          show.show_foh_staffing?.map((assignment: any) => ({
            name:
              assignment.staff_name ||
              assignment.role_label ||
              "Unknown",
            department: "FOH",
            assignmentType: "foh",
          })) || [];

        return {
          title: show.name,
          start: show.date_time,
          extendedProps: {
            venue: show.venue,
            crewCall: show.crew_call,
            showId: show.id,
            technicalStaff,
            fohStaff,
          },
        };
      }) || [];

    setEvents(formattedEvents);
  }

  const isAdmin = profile?.role === "admin" || profile?.role === "Admin";
  const userDepartment = profile?.department?.toLowerCase() || "";

  const technicalStaff =
    selectedEvent?.extendedProps?.technicalStaff || [];

  const fohStaff =
    selectedEvent?.extendedProps?.fohStaff || [];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>

        <p className="mt-2 text-zinc-400">
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

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <InfoBlock
              label="Show Time"
              value={selectedEvent?.start?.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />

            <InfoBlock
              label="Venue"
              value={selectedEvent?.extendedProps?.venue}
            />

            {!userDepartment.includes("foh") && (
  <InfoBlock
    label="Technical Crew Call"
    value={selectedEvent?.extendedProps?.crewCall?.slice(
      0,
      5
    )}
  />
)}

            {isAdmin ? (
              <div className="space-y-4">
                <StaffSection
                  title="Technical Crew"
                  staff={technicalStaff}
                />

                <StaffSection
                  title="FOH Crew"
                  staff={fohStaff}
                />
              </div>
            ) : userDepartment.includes("technical") ? (
              <StaffSection
                title="Technical Crew"
                staff={technicalStaff}
              />
            ) : userDepartment.includes("foh") ? (
              <StaffSection title="FOH Crew" staff={fohStaff} />
            ) : null}

            {(isAdmin || !userDepartment.includes("foh")) && (
  <Link
    href={`/shows/${selectedEvent?.extendedProps?.showId}`}
    className="block w-full rounded-xl bg-indigo-600 py-3 text-center font-medium transition hover:bg-indigo-500"
  >
    More Details
  </Link>
)}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-medium">
        {value || "Not set"}
      </p>
    </div>
  );
}

function StaffSection({
  title,
  staff,
}: {
  title: string;
  staff: StaffMember[];
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-zinc-400">{title}</p>

      <div className="flex flex-wrap gap-2">
        {staff.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No staff assigned.
          </p>
        ) : (
          staff.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium"
            >
              {member.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}