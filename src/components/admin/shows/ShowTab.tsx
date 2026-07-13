import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TabsContent } from "@/components/ui/tabs";

import Field from "./Field";

import type { ShowForm } from "./types";
import type { EventType } from "@/lib/eventStyles";

export default function ShowTab({
    form,
    setForm,
    venues,
}: {
    form: ShowForm;
    setForm: React.Dispatch<React.SetStateAction<ShowForm>>;
    venues: any [];
}) {
    return(
<TabsContent value="show">
  <div className="mt-6 space-y-6">
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Event Details
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Show Name">
            <input
              placeholder="Show Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Venue">
          <select
            value={form.venue_id || ""}
            onChange={(e) => {
              const selectedVenue = venues.find(
                (venue) => venue.id === Number(e.target.value)
              );

              setForm({
                ...form,
                venue_id: selectedVenue?.id || null,
                venue: selectedVenue?.name || "",
              });
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          >
            <option className="bg-zinc-900 text-white" value="">
              Select Venue
            </option>

            {venues.map((venue) => (
              <option
                className="bg-zinc-900 text-white"
                key={venue.id}
                value={venue.id}
              >
                {venue.name}
              </option>
            ))}
          </select>
        </Field>
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Timing
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Show Date & Time">
          <DatePicker
            selected={form.date_time}
            onChange={(date: Date | null) =>
              setForm({ ...form, date_time: date })
            }
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd MMM yyyy HH:mm"
            placeholderText="Select date and time"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </Field>

        <Field label="Running Time">
          <input
            value={form.running_time}
            onChange={(e) =>
              setForm({ ...form, running_time: e.target.value })
            }
            placeholder="45 - 20 - 45"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </Field>

        <Field label="Crew Call">
          <DatePicker
            selected={
              form.crew_call
                ? new Date(`1970-01-01T${form.crew_call}`)
                : null
            }
            onChange={(date: Date | null) => {
              if (!date) return;
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");
              setForm({ ...form, crew_call: `${hours}:${minutes}` });
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            placeholderText="Select crew call"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </Field>
      </div>
    </section>

    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Status
      </h3>

      <Field label="Show Cancelled">
        <button
          type="button"
          onClick={() =>
            setForm({ ...form, cancelled: !form.cancelled })
          }
          className="flex h-[50px] w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left md:max-w-sm"
        >
          <span className="text-sm text-zinc-300">
            {form.cancelled ? "Cancelled" : "Active"}
          </span>

          <span
            className={`relative h-6 w-11 rounded-full transition ${
              form.cancelled ? "bg-red-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                form.cancelled ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>
      </Field>
    </section>
  </div>
</TabsContent>
);
}