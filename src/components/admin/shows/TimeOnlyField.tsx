import Field from "./Field";
import DatePicker from "react-datepicker";
import type { ReactNode } from "react";

export default function TimeOnlyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <DatePicker
        selected={value ? new Date(`1970-01-01T${value}`) : null}
        onChange={(date: Date | null) => {
          if (!date) return;
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          onChange(`${hours}:${minutes}`);
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="HH:mm"
        placeholderText="Select time"
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </Field>
  );
}