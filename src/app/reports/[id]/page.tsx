"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ReportPage() {
  const params = useParams();
  const reportId = Number(params.id);

  const [report, setReport] = useState<any>(null);
  const [requiresOpeningChecks, setRequiresOpeningChecks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    async function loadReport() {
      const { data, error } = await supabase
        .from("show_reports")
        .select("*, venues(requires_opening_checks)")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setReport(data);
      setRequiresOpeningChecks(data.venues?.requires_opening_checks || false);
    }

    loadReport();
  }, [reportId]);

  useEffect(() => {
    if (!report || !dirty) return;

    const timeout = setTimeout(() => {
      saveReport();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [report, dirty]);

  function updateField(field: string, value: any) {
  if (report?.status === "submitted") return;
    setReport((current: any) => ({
      ...current,
      [field]: value,
    }));

    setDirty(true);
  }

  async function saveReport() {
    if (!report || !dirty) return;

    setSaving(true);

    const { error } = await supabase
      .from("show_reports")
      .update({
        backstage_doors_unlocked: report.backstage_doors_unlocked,
        sides_open: report.sides_open,
        sides_open_reason: report.sides_open_reason,
        structure_damage: report.structure_damage,
        structure_damage_details: report.structure_damage_details,
        opening_meter_reading: report.opening_meter_reading,
        lx_working: report.lx_working,
        pa_working: report.pa_working,
        dressing_rooms_set_up: report.dressing_rooms_set_up,
        additional_equipment_on_site: report.additional_equipment_on_site,
        opening_comments: report.opening_comments,
        house_open_time: report.house_open_time,
        act_1_clearance_time: report.act_1_clearance_time,
        act_1_start_time: report.act_1_start_time,
        act_1_end_time: report.act_1_end_time,
        act_2_clearance_time: report.act_2_clearance_time,
        act_2_start_time: report.act_2_start_time,
        act_2_end_time: report.act_2_end_time,

        technical_issues_venue: report.technical_issues_venue,
        technical_issues_company: report.technical_issues_company,
        foh_issues: report.foh_issues,
        health_safety_incidents: report.health_safety_incidents,
        additional_recharges: report.additional_recharges,
        general_comments: report.general_comments,
        sides_closed: report.sides_closed,
        sides_closed_reason: report.sides_closed_reason,
        barriers_in_place: report.barriers_in_place,
        new_structure_damage: report.new_structure_damage,
        new_structure_damage_details: report.new_structure_damage_details,
        closing_meter_reading: report.closing_meter_reading,
        bins_emptied: report.bins_emptied,
        doors_locked: report.doors_locked,
        updated_at: new Date().toISOString(),
        
      })
      .eq("id", reportId);

    setSaving(false);

    if (error) {
      console.error(error);
      return;
    }

    setDirty(false);
    setLastSaved(new Date().toLocaleTimeString("en-GB"));
  }

  if (!report) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading report...</p>
      </AppLayout>
    );
  }
async function submitReport() {
  const confirmed = window.confirm(
    "Submit this report? This will finalise the report and disable editing."
  );

  if (!confirmed) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("show_reports")
    .update({
      status: "submitted",
      submitted_by: user?.id || null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    console.error(error);
    alert("Failed to submit report.");
    return;
  }

  setReport((current: any) => ({
    ...current,
    status: "submitted",
  }));

  alert("Report submitted successfully.");
}
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Show Report
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {report.show_name || "Untitled Show"}
            </h1>

            <p className="mt-2 text-zinc-400">
              {report.venue_name} · {report.performance_date} ·{" "}
              {report.performance_time}
            </p>
          </div>

          <div className="text-right text-sm text-zinc-400">
            <p>Status: {report.status}</p>

            <p>
              {saving
                ? "Saving..."
                : lastSaved
                ? `Last saved ${lastSaved}`
                : "Autosave ready"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="opening" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
            <TabsTrigger
  value="opening"
  className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
>
  Opening Checks
</TabsTrigger>

<TabsTrigger
  value="show"
  className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
>
  Show Timings & Notes
</TabsTrigger>

<TabsTrigger
  value="closing"
  className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
>
  Closing Checks
</TabsTrigger>

<TabsTrigger
  value="submit"
  className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
>
  Submit
</TabsTrigger>
          </TabsList>

          <TabsContent value="opening">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">Opening Checks</h2>

              {!requiresOpeningChecks ? (
                <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                  Opening checks are not required for this venue.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <YesNo
                    label="Backstage Doors Unlocked"
                    value={report.backstage_doors_unlocked}
                    onChange={(value) =>
                      updateField("backstage_doors_unlocked", value)
                    }
                  />

                  <YesNo
                    label="Sides Open"
                    value={report.sides_open}
                    onChange={(value) =>
                      updateField("sides_open", value)
                    }
                  />

                  {report.sides_open === false && (
                    <TextArea
                      label="Reason for sides not opened"
                      value={report.sides_open_reason}
                      onChange={(value) =>
                        updateField("sides_open_reason", value)
                      }
                    />
                  )}

                  <YesNo
                    label="Any Damage To Structure"
                    value={report.structure_damage}
                    onChange={(value) =>
                      updateField("structure_damage", value)
                    }
                  />

                  {report.structure_damage === true && (
                    <TextArea
                      label="Damage Detail"
                      value={report.structure_damage_details}
                      onChange={(value) =>
                        updateField("structure_damage_details", value)
                      }
                    />
                  )}

                  <TextInput
                    label="Meter Reading"
                    value={report.opening_meter_reading}
                    onChange={(value) =>
                      updateField("opening_meter_reading", value)
                    }
                  />

                  <YesNo
                    label="LX Working"
                    value={report.lx_working}
                    onChange={(value) =>
                      updateField("lx_working", value)
                    }
                  />

                  <YesNo
                    label="PA Working"
                    value={report.pa_working}
                    onChange={(value) =>
                      updateField("pa_working", value)
                    }
                  />

                  <YesNo
                    label="Dressing Rooms Set Up"
                    value={report.dressing_rooms_set_up}
                    onChange={(value) =>
                      updateField("dressing_rooms_set_up", value)
                    }
                  />

                  <YesNo
                    label="Additional Equipment On Site"
                    value={report.additional_equipment_on_site}
                    onChange={(value) =>
                      updateField("additional_equipment_on_site", value)
                    }
                  />

                  <TextArea
                    label="Comments"
                    value={report.opening_comments}
                    onChange={(value) =>
                      updateField("opening_comments", value)
                    }
                  />
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="show">
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
    <h2 className="text-2xl font-bold">
      Show Timings & Notes
    </h2>

    <div className="mt-6 space-y-6">

  <div className="max-w-sm">
    <TimeField
      label="House Open"
      value={report.house_open_time}
      onChange={(value) =>
        updateField("house_open_time", value)
      }
    />
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <TimeField
      label="Act 1 Clearance"
      value={report.act_1_clearance_time}
      onChange={(value) =>
        updateField("act_1_clearance_time", value)
      }
    />

    <TimeField
      label="Act 1 Start"
      value={report.act_1_start_time}
      onChange={(value) =>
        updateField("act_1_start_time", value)
      }
    />

    <TimeField
      label="Act 1 End"
      value={report.act_1_end_time}
      onChange={(value) =>
        updateField("act_1_end_time", value)
      }
    />
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <TimeField
      label="Act 2 Clearance"
      value={report.act_2_clearance_time}
      onChange={(value) =>
        updateField("act_2_clearance_time", value)
      }
    />

    <TimeField
      label="Act 2 Start"
      value={report.act_2_start_time}
      onChange={(value) =>
        updateField("act_2_start_time", value)
      }
    />

    <TimeField
      label="Act 2 End"
      value={report.act_2_end_time}
      onChange={(value) =>
        updateField("act_2_end_time", value)
      }
    />
  </div>

  <TextArea
    label="Technical Issues (Venue)"
    value={report.technical_issues_venue}
    onChange={(value) =>
      updateField("technical_issues_venue", value)
    }
  />

  <TextArea
    label="Technical Issues (Company)"
    value={report.technical_issues_company}
    onChange={(value) =>
      updateField("technical_issues_company", value)
    }
  />

  <TextArea
    label="FOH Issues"
    value={report.foh_issues}
    onChange={(value) =>
      updateField("foh_issues", value)
    }
  />

  <TextArea
    label="H&S Incidents"
    value={report.health_safety_incidents}
    onChange={(value) =>
      updateField("health_safety_incidents", value)
    }
  />

  <TextArea
    label="General Comments"
    value={report.general_comments}
    onChange={(value) =>
      updateField("general_comments", value)
    }
  />

  <TextArea
    label="Additional Recharges"
    value={report.additional_recharges}
    onChange={(value) =>
      updateField("additional_recharges", value)
    }
  />
</div>
  </section>
</TabsContent>

          <TabsContent value="closing">
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
    <h2 className="text-2xl font-bold">Closing Checks</h2>

    {!requiresOpeningChecks ? (
      <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
        Closing checks are not required for this venue.
      </p>
    ) : (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <YesNo
          label="Sides Closed"
          value={report.sides_closed}
          onChange={(value) => updateField("sides_closed", value)}
        />

        {report.sides_closed === false && (
          <>
            <TextArea
              label="Reason For Sides Not Closed"
              value={report.sides_closed_reason}
              onChange={(value) =>
                updateField("sides_closed_reason", value)
              }
            />

            <YesNo
              label="Barriers In Place"
              value={report.barriers_in_place}
              onChange={(value) =>
                updateField("barriers_in_place", value)
              }
            />
          </>
        )}

        <YesNo
          label="Any New Damage To Structure"
          value={report.new_structure_damage}
          onChange={(value) =>
            updateField("new_structure_damage", value)
          }
        />

        {report.new_structure_damage === true && (
          <TextArea
            label="New Damage Details"
            value={report.new_structure_damage_details}
            onChange={(value) =>
              updateField("new_structure_damage_details", value)
            }
          />
        )}

        <TextInput
          label="Closing Meter Reading"
          value={report.closing_meter_reading}
          onChange={(value) =>
            updateField("closing_meter_reading", value)
          }
        />

        <YesNo
          label="Bins Emptied"
          value={report.bins_emptied}
          onChange={(value) => updateField("bins_emptied", value)}
        />

        <YesNo
          label="Doors Locked"
          value={report.doors_locked}
          onChange={(value) => updateField("doors_locked", value)}
        />
      </div>
    )}
  </section>
</TabsContent>

         <TabsContent value="submit">
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
    <h2 className="text-2xl font-bold">
      Submit / Finalise
    </h2>

    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="font-medium text-white">
          Ready to submit?
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Submitting this report will mark it as completed
          and lock further editing.
        </p>
      </div>

      {report.status === "submitted" ? (
        <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4">
          <p className="font-medium text-green-300">
            Report Submitted
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            This report has already been finalised.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={submitReport}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
        >
          Submit Report
        </button>
      )}
    </div>
  </section>
</TabsContent>
        </Tabs>

        <div className="flex gap-3">
         <button
         type="button"
         onClick={saveReport}
         disabled={report.status === "submitted"}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Draft
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  function setNow() {
    const now = new Date();

    const time = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    onChange(time);
  }

  return (
    <div>
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <div className="flex gap-2">
        <input
          type="time"
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />

        <button
          type="button"
          onClick={setNow}
          className="rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700"
        >
          Now
        </button>
      </div>
    </div>
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
    <label className="md:col-span-2">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </label>
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
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
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