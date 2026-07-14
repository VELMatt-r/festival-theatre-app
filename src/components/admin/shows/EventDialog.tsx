"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { EVENT_TYPES, type EventType } from "@/lib/eventStyles";
import EventCrewAssignment from "./EventCrewAssignment";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { emptyShowEvent} from "./types";

import type {
  ShowEventForm,
  ShowReportType,
} from "./types";

// =====================================================
// Types
// =====================================================

type EventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ShowEventForm | null;
  onSave: (event: ShowEventForm) => void;
  parentDate: Date | null;
  reportTypes: ShowReportType[];
};

// =====================================================
// Component
// =====================================================

export default function EventDialog({
  open,
  onOpenChange,
  event,
  onSave,
  parentDate,
  reportTypes,
}: EventDialogProps) {
  const [form, setForm] = useState<ShowEventForm>({
    ...emptyShowEvent,
  });

  const isEditing = event !== null;
  const canAssignCrew = Boolean(form.id);

  // Reset the form whenever the dialog opens or the selected event changes.
 useEffect(() => {
  if (!open) return;

  if (event) {
    setForm({
      ...event,
    });

    return;
  }

  const defaultDate = parentDate
    ? new Date(parentDate)
    : null;

  setForm({
    ...emptyShowEvent,
    start_time: defaultDate,
    end_time: defaultDate ? new Date(defaultDate) : null,
  });
}, [open, event, parentDate]);

  function updateForm<K extends keyof ShowEventForm>(
    field: K,
    value: ShowEventForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSave() {
    if (!form.title.trim()) {
      alert("Please enter an event tilte.");
      return;
    }

    if (!form.start_time) {
      alert("Please choose a start date and time.");
      return;
    }

    if (form.end_time && form.end_time < form.start_time) {
      alert("The event end time cannot be before its start time.");
      return;
    }

    onSave({
      ...form,
    });

    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? "Edit Event" : "Add Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Event Title
              </span>
              <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateForm("title", event.target.value)
              }
              placeholder="e.g. Evening Performance, Lighting Focus"
              className="w-full rounded-x1 border borger-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
              />
            </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Event Type
              </span>

              <select
                value={form.event_type}
                onChange={(event) =>
                  updateForm("event_type", event.target.value as EventType)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                {Object.keys(EVENT_TYPES).map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
  <div className="space-y-2">
    <p className="text-sm font-medium text-zinc-300">
      Reports Required
    </p>

    <div className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
      {reportTypes.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No report types available.
        </p>
      ) : (
        reportTypes.map((reportType) => {
          const selected = form.report_type_ids.includes(
            reportType.id
          );

          return (
            <label
              key={reportType.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => {
                  setForm((current) => ({
                    ...current,
                    report_type_ids: selected
                      ? current.report_type_ids.filter(
                          (id) => id !== reportType.id
                        )
                      : [
                          ...current.report_type_ids,
                          reportType.id,
                        ],
                  }));
                }}
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="font-medium text-white">
                  {reportType.name}
                </p>

                {reportType.description && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {reportType.description}
                  </p>
                )}
              </div>
            </label>
          );
        })
      )}
    </div>
  </div>
</div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Start Date and Time
              </span>

              <DatePicker
                selected={form.start_time}
                onChange={(date: Date | null) => {
                  setForm((current) => {
                    const shouldMoveEnd =
                      !current.end_time ||
                      current.end_time.getTime() ===
                      current.start_time?.getTime();

                    return {
                      ...current,
                      start_time: date,
                      end_time: shouldMoveEnd
                      ? date
                      ? new Date(date)
                      : null
                      : current.end_time,
                      };
                    });
                  }}
                showTimeSelect
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Choose start date and time"
                wrapperClassName="w-full"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                End Date and Time
              </span>

              <DatePicker
                selected={form.end_time}
                onChange={(date: Date | null) =>
                  updateForm("end_time", date)
                }
                showTimeSelect
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Optional"
                minDate={form.start_time ?? undefined}
                wrapperClassName="w-full"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Crew Call
              </span>

              <input
                type="time"
                value={form.crew_call}
                onChange={(event) =>
                  updateForm("crew_call", event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 sm:self-end">
              <input
                type="checkbox"
                checked={form.cancelled}
                onChange={(event) =>
                  updateForm("cancelled", event.target.checked)
                }
                className="h-4 w-4 rounded border-zinc-600"
              />

              <span className="text-sm font-medium text-zinc-300">
                Event cancelled
              </span>
            </label>
          </div>

         <div className="space-y-2">
            {canAssignCrew ? (
              <EventCrewAssignment eventId={form.id!} />
            ) : (
              <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-sm font-medium text-zinc-300">
                  Technical Crew
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Save the show first before assigning crew to this event.
                </p>
              </div>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">
              Notes
            </span>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateForm("notes", event.target.value)
              }
              rows={4}
              placeholder="Optional notes for this event..."
              className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
            />
          </label>

          <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              {isEditing ? "Update Event" : "Add Event"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}