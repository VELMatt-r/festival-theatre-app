import type { ShowEventForm } from "./types";
import { EVENT_TYPES, type EventType } from "@/lib/eventStyles";

type EventCardProps = {
  event: ShowEventForm;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EventCard({
  event,
  onEdit,
  onDelete,
}: EventCardProps) {

      const eventType = event.event_type as EventType;
      const eventStyle = EVENT_TYPES[eventType] ?? EVENT_TYPES.Show;
      const patternClass = `event-pattern-${eventStyle.pattern}`;

  return (
    <div
      className={`overflow-hidden rounded-2x1 border ${event.cancelled
        ? "border-red-800 bg-red-950/40"
        : "border-zinc-700 bg-zinc-950/40"
      }`}
      >
    <div className="flex">
        <div className={`flex w-16 shrink-0 items-center justify-center border-r border-white/10 ${patternClass}`}>
            <span className="-rotate-90 whitespace-nowrap text-sm font-semibold text-white">
                {event.event_type}
            </span>
        </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-lg font-semibold ${
                event.cancelled
                  ? "text-zinc-400 line-through"
                  : "text-white"
              }`}
            >
              {event.title}
            </h3>

            {event.cancelled && (
              <span className="rounded-full bg-red-950 px-2.5 py-1 text-xs font-medium text-red-300">
                Cancelled
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {event.event_type}
          </p>

          <div className="mt-3 space-y-1 text-sm text-zinc-400">
            <p>
              <span className="text-zinc-500">Starts:</span>{" "}
              {formatDateTime(event.start_time)}
            </p>

            {event.end_time && (
              <p>
                <span className="text-zinc-500">Ends:</span>{" "}
                {formatDateTime(event.end_time)}
              </p>
            )}

            <p>
              <span className="text-zinc-500">Crew Call:</span>{" "}
              {event.crew_call || "Not set"}
            </p>

            <p>
              <span className="text-zinc-500">Report:</span>{" "}
              {event.report_type}
            </p>
          </div>

          {event.notes && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">
              {event.notes}
            </p>
          )}
        </div>

        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="border-l border-white/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not set";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}