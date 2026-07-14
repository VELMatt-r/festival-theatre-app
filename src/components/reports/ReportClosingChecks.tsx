type ReportClosingChecksProps = {
  report: any;
  requiresOpeningChecks: boolean;
  onChange: (field: string, value: unknown) => void;
};

export default function ReportClosingChecks({
  report,
  requiresOpeningChecks,
  onChange,
}: ReportClosingChecksProps) {
  if (!requiresOpeningChecks) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
        Closing checks are not required for this venue.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <YesNo
        label="Sides Closed"
        value={report.sides_closed}
        onChange={(value) => onChange("sides_closed", value)}
      />

      {report.sides_closed === false && (
        <>
          <TextArea
            label="Reason for Sides Not Closed"
            value={report.sides_closed_reason}
            onChange={(value) =>
              onChange("sides_closed_reason", value)
            }
          />

          <YesNo
            label="Barriers in Place"
            value={report.barriers_in_place}
            onChange={(value) =>
              onChange("barriers_in_place", value)
            }
          />
        </>
      )}

      <YesNo
        label="Any New Damage to Structure"
        value={report.new_structure_damage}
        onChange={(value) =>
          onChange("new_structure_damage", value)
        }
      />

      {report.new_structure_damage === true && (
        <TextArea
          label="New Damage Details"
          value={report.new_structure_damage_details}
          onChange={(value) =>
            onChange("new_structure_damage_details", value)
          }
        />
      )}

      <TextInput
        label="Closing Meter Reading"
        value={report.closing_meter_reading}
        onChange={(value) =>
          onChange("closing_meter_reading", value)
        }
      />

      <YesNo
        label="Bins Emptied"
        value={report.bins_emptied}
        onChange={(value) => onChange("bins_emptied", value)}
      />

      <YesNo
        label="Doors Locked"
        value={report.doors_locked}
        onChange={(value) => onChange("doors_locked", value)}
      />
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  const checked = value === true;

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
        checked
          ? "border-green-500 bg-green-950/30 text-white"
          : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600"
      }`}
    >
      <span>{label}</span>

      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
          checked
            ? "border-green-400 bg-green-500 text-white"
            : "border-zinc-600 text-zinc-500"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </label>
  );
}