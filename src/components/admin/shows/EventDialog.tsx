"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { EVENT_TYPES, type EventType } from "@/lib/eventStyles";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  emptyShowEvent,
  type ShowEventForm,
} from "./types";

// =====================================================
// Types
// =====================================================

type EventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ShowEventForm | null;
  onSave: (event: ShowEventForm) => void;
};

// =====================================================
// Constants
// =====================================================

const REPORT_TYPES: ShowEventForm["report_type"][] = [
  "Technical",
  "FOH",
  "Both",
  "None",
];

// =====================================================
// Component
// =====================================================

export default function EventDialog({
  open,
  onOpenChange,
  event,
  onSave,
}: EventDialogProps) {
  const [form, setForm] = useState<ShowEventForm>({
    ...emptyShowEvent,
  });

  const isEditing = event !== null;

  // Reset the form whenever the dialog opens or the selected event changes.
  useEffect(() => {
    if (!open) return;

    setForm(
      event
        ? {
            ...event,
          }
        : {
            ...emptyShowEvent,
          }
    );
  }, [open, event]);

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

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Report Type
              </span>

              <select
                value={form.report_type}
                onChange={(event) =>
                  updateForm(
                    "report_type",
                    event.target.value as ShowEventForm["report_type"]
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                {REPORT_TYPES.map((reportType) => (
                  <option key={reportType} value={reportType}>
                    {reportType}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-300">
                Start Date and Time
              </span>

              <DatePicker
                selected={form.start_time}
                onChange={(date: Date | null) =>
                  updateForm("start_time", date)
                }
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