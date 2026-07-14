type ReportOpeningChecksProps = {
  report: any;
  requiresOpeningChecks: boolean;
  onChange: (field: string, value: unknown) => void;
};

export default function ReportOpeningChecks({
  report,
  requiresOpeningChecks,
  onChange,
}: ReportOpeningChecksProps) {
  if (!requiresOpeningChecks) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
        Opening checks are not required for this venue.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <YesNo
        label="Backstage Doors Unlocked"
        value={report.backstage_doors_unlocked}
        onChange={(value) =>
          onChange("backstage_doors_unlocked", value)
        }
      />

      <YesNo
        label="Sides Open"
        value={report.sides_open}
        onChange={(value) => onChange("sides_open", value)}
      />

      {report.sides_open === false && (
        <TextArea
          label="Reason for sides not opened"
          value={report.sides_open_reason}
          onChange={(value) =>
            onChange("sides_open_reason", value)
          }
        />
      )}

      <YesNo
        label="Any Damage to Structure"
        value={report.structure_damage}
        onChange={(value) =>
          onChange("structure_damage", value)
        }
      />

      {report.structure_damage === true && (
        <TextArea
          label="Damage Details"
          value={report.structure_damage_details}
          onChange={(value) =>
            onChange("structure_damage_details", value)
          }
        />
      )}

      <TextInput
        label="Meter Reading"
        value={report.opening_meter_reading}
        onChange={(value) =>
          onChange("opening_meter_reading", value)
        }
      />

      <YesNo
        label="LX Working"
        value={report.lx_working}
        onChange={(value) => onChange("lx_working", value)}
      />

      <YesNo
        label="PA Working"
        value={report.pa_working}
        onChange={(value) => onChange("pa_working", value)}
      />

      <YesNo
        label="Dressing Rooms Set Up"
        value={report.dressing_rooms_set_up}
        onChange={(value) =>
          onChange("dressing_rooms_set_up", value)
        }
      />

      <YesNo
        label="Additional Equipment on Site"
        value={report.additional_equipment_on_site}
        onChange={(value) =>
          onChange("additional_equipment_on_site", value)
        }
      />

      <div className="md:col-span-2">
        <TextArea
          label="Comments"
          value={report.opening_comments}
          onChange={(value) =>
            onChange("opening_comments", value)
          }
        />
      </div>
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