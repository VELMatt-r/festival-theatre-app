"use client";

import TechnicalGetInReport from "@/components/reports/TechnicalGetInReport";
import TechnicalRehearsalReport from "@/components/reports/TechnicalRehearsalReport";

import { useCallback, useEffect, useState } from "react";
import { useShowReport } from "@/components/reports/useShowReport";
import { useParams } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const TAB_TRIGGER_CLASS =
  "shrink-0 rounded-xl px-4 py-2 text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white";

export default function ReportPage() {
  const params = useParams();
  const reportId = Number(params.id);
  const [reportFormKey, setReportFormKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadReportType() {
    const { data, error } = await supabase
      .from("show_reports")
      .select("report_form_key")
      .eq("id", reportId)
      .single();

    if (error) {
      console.error("Load report type failed:", error);
      setLoading(false);
      return;
    }

    setReportFormKey(data.report_form_key || "technical-show");
    setLoading(false);
  }

  if (Number.isFinite(reportId)) {
    loadReportType();
  }
}, [reportId]);

const getUpdatePayload = useCallback(
  (currentReport: Record<string, any>) => ({
    backstage_doors_unlocked:
      currentReport.backstage_doors_unlocked,
    sides_open: currentReport.sides_open,
    sides_open_reason:
      currentReport.sides_open_reason,
    structure_damage:
      currentReport.structure_damage,
    structure_damage_details:
      currentReport.structure_damage_details,
    opening_meter_reading:
      currentReport.opening_meter_reading,
    lx_working:
      currentReport.lx_working,
    pa_working:
      currentReport.pa_working,
    dressing_rooms_set_up:
      currentReport.dressing_rooms_set_up,
    additional_equipment_on_site:
      currentReport.additional_equipment_on_site,
    opening_comments:
      currentReport.opening_comments,

    house_open_time:
      currentReport.house_open_time,
    act_1_clearance_time:
      currentReport.act_1_clearance_time,
    act_1_start_time:
      currentReport.act_1_start_time,
    act_1_end_time:
      currentReport.act_1_end_time,

    act_1_sound_foh:
      currentReport.act_1_sound_foh,
    act_1_sound_box_office:
      currentReport.act_1_sound_box_office,
    act_1_sound_lake:
      currentReport.act_1_sound_lake,
    act_1_sound_cottages:
      currentReport.act_1_sound_cottages,
    act_1_sound_top_gate:
      currentReport.act_1_sound_top_gate,

    act_2_clearance_time:
      currentReport.act_2_clearance_time,
    act_2_start_time:
      currentReport.act_2_start_time,
    act_2_end_time:
      currentReport.act_2_end_time,

    act_2_sound_foh:
      currentReport.act_2_sound_foh,
    act_2_sound_box_office:
      currentReport.act_2_sound_box_office,
    act_2_sound_lake:
      currentReport.act_2_sound_lake,
    act_2_sound_cottages:
      currentReport.act_2_sound_cottages,
    act_2_sound_top_gate:
      currentReport.act_2_sound_top_gate,

    technical_issues_venue:
      currentReport.technical_issues_venue,
    technical_issues_company:
      currentReport.technical_issues_company,
    foh_issues:
      currentReport.foh_issues,
    health_safety_incidents:
      currentReport.health_safety_incidents,
    general_comments:
      currentReport.general_comments,
    additional_recharges:
      currentReport.additional_recharges,

    sides_closed:
      currentReport.sides_closed,
    sides_closed_reason:
      currentReport.sides_closed_reason,
    barriers_in_place:
      currentReport.barriers_in_place,
    new_structure_damage:
      currentReport.new_structure_damage,
    new_structure_damage_details:
      currentReport.new_structure_damage_details,
    closing_meter_reading:
      currentReport.closing_meter_reading,
    bins_emptied:
      currentReport.bins_emptied,
    doors_locked:
      currentReport.doors_locked,
  }),
  []
);

const {
  report,
  loading: reportLoading,
  saving,
  dirty,
  lastSaved,
  requiresOpeningChecks,
  isSubmitted,
  updateField,
  saveReport,
  submitReport,
} = useShowReport({
  reportId,
  reportLabel: "Technical Show",
  getUpdatePayload,
  getActivityDescription: (currentReport) =>
    `Submitted Technical Show report for ${
      currentReport.show_name || "Unknown Event"
    }`,
});

    // =====================================================
  // Report Routing
  // =====================================================

  if (loading) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading report...</p>
      </AppLayout>
    );
  }

  if (reportFormKey === "technical-getin") {
    return <TechnicalGetInReport reportId={reportId} />;
  }

  if (reportFormKey === "technical-rehearsal") {
  return <TechnicalRehearsalReport reportId={reportId} />;
}

  // =====================================================
  // Technical Show Report
  // =====================================================

  if (!report) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading report...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Technical Show Report
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {report.show_name || "Untitled Show"}
            </h1>

            <p className="mt-2 text-zinc-400">
              {report.venue_name} · {formatDisplayDate(report.performance_date)}
              {" · "}
              {report.performance_time || "No time"}
            </p>

            {isSubmitted && (
              <div className="mt-3 rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-sm text-zinc-300">
                <p className="font-medium text-green-300">
                  Submitted Report
                </p>

                <p className="mt-1">
                  Submitted by {report.submitted_by_name || "Unknown"}
                </p>

                <p>
                  Submitted at{" "}
                  {report.submitted_at
                    ? new Date(report.submitted_at).toLocaleString(
                        "en-GB"
                      )
                    : "Unknown"}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left text-sm text-zinc-400 md:text-right">
            <p>Status: {report.status}</p>
            <p>
              {saving
                ? "Saving..."
                : dirty
                ? "Unsaved changes"
                : lastSaved
                ? `Last saved ${lastSaved}`
                : "Autosave ready"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="opening" className="space-y-6">
          <div className="-mx-2 overflow-x-auto px-2 pb-1">
            <TabsList className="flex w-max min-w-full gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
              <TabsTrigger value="opening" className={TAB_TRIGGER_CLASS}>
                <span className="hidden sm:inline">Opening Checks</span>
                <span className="sm:hidden">Opening</span>
              </TabsTrigger>

              <TabsTrigger value="act-1" className={TAB_TRIGGER_CLASS}>
                Act 1
              </TabsTrigger>

              <TabsTrigger value="act-2" className={TAB_TRIGGER_CLASS}>
                Act 2
              </TabsTrigger>

              <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS}>
                Notes
              </TabsTrigger>

              <TabsTrigger value="closing" className={TAB_TRIGGER_CLASS}>
                <span className="hidden sm:inline">Closing Checks</span>
                <span className="sm:hidden">Closing</span>
              </TabsTrigger>

              <TabsTrigger value="submit" className={TAB_TRIGGER_CLASS}>
                Submit
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="opening">
            <ReportSection title="Opening Checks">
              {!requiresOpeningChecks ? (
                <Notice>
                  Opening checks are not required for this venue.
                </Notice>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
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
                    label="Any Damage to Structure"
                    value={report.structure_damage}
                    onChange={(value) =>
                      updateField("structure_damage", value)
                    }
                  />

                  {report.structure_damage === true && (
                    <TextArea
                      label="Damage Details"
                      value={report.structure_damage_details}
                      onChange={(value) =>
                        updateField(
                          "structure_damage_details",
                          value
                        )
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
                    label="Additional Equipment on Site"
                    value={report.additional_equipment_on_site}
                    onChange={(value) =>
                      updateField(
                        "additional_equipment_on_site",
                        value
                      )
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
            </ReportSection>
          </TabsContent>

          <TabsContent value="act-1">
            <ReportSection title="Act 1">
              <div className="space-y-7">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                    Timings
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <TimeField
                      label="House Open Time"
                      value={report.house_open_time}
                      onChange={(value) =>
                        updateField("house_open_time", value)
                      }
                    />

                    <TimeField
                      label="Clearance Time"
                      value={report.act_1_clearance_time}
                      onChange={(value) =>
                        updateField("act_1_clearance_time", value)
                      }
                    />

                    <TimeField
                      label="Start Time"
                      value={report.act_1_start_time}
                      onChange={(value) =>
                        updateField("act_1_start_time", value)
                      }
                    />

                    <TimeField
                      label="End Time"
                      value={report.act_1_end_time}
                      onChange={(value) =>
                        updateField("act_1_end_time", value)
                      }
                    />
                  </div>
                </div>

                <SoundLevelsSection
                  values={{
                    foh: report.act_1_sound_foh,
                    boxOffice: report.act_1_sound_box_office,
                    lake: report.act_1_sound_lake,
                    cottages: report.act_1_sound_cottages,
                    topGate: report.act_1_sound_top_gate,
                  }}
                  onChange={(field, value) =>
                    updateField(`act_1_sound_${field}`, value)
                  }
                />
              </div>
            </ReportSection>
          </TabsContent>

          <TabsContent value="act-2">
            <ReportSection title="Act 2">
              <div className="space-y-7">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                    Timings
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <TimeField
                      label="Clearance Time"
                      value={report.act_2_clearance_time}
                      onChange={(value) =>
                        updateField("act_2_clearance_time", value)
                      }
                    />

                    <TimeField
                      label="Start Time"
                      value={report.act_2_start_time}
                      onChange={(value) =>
                        updateField("act_2_start_time", value)
                      }
                    />

                    <TimeField
                      label="End Time"
                      value={report.act_2_end_time}
                      onChange={(value) =>
                        updateField("act_2_end_time", value)
                      }
                    />
                  </div>
                </div>

                <SoundLevelsSection
                  values={{
                    foh: report.act_2_sound_foh,
                    boxOffice: report.act_2_sound_box_office,
                    lake: report.act_2_sound_lake,
                    cottages: report.act_2_sound_cottages,
                    topGate: report.act_2_sound_top_gate,
                  }}
                  onChange={(field, value) =>
                    updateField(`act_2_sound_${field}`, value)
                  }
                />
              </div>
            </ReportSection>
          </TabsContent>

          <TabsContent value="notes">
            <ReportSection title="Notes">
              <div className="space-y-4">
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
                    updateField(
                      "health_safety_incidents",
                      value
                    )
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
            </ReportSection>
          </TabsContent>

          <TabsContent value="closing">
            <ReportSection title="Closing Checks">
              {!requiresOpeningChecks ? (
                <Notice>
                  Closing checks are not required for this venue.
                </Notice>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <YesNo
                    label="Sides Closed"
                    value={report.sides_closed}
                    onChange={(value) =>
                      updateField("sides_closed", value)
                    }
                  />

                  {report.sides_closed === false && (
                    <>
                      <TextArea
                        label="Reason for Sides Not Closed"
                        value={report.sides_closed_reason}
                        onChange={(value) =>
                          updateField(
                            "sides_closed_reason",
                            value
                          )
                        }
                      />

                      <YesNo
                        label="Barriers in Place"
                        value={report.barriers_in_place}
                        onChange={(value) =>
                          updateField("barriers_in_place", value)
                        }
                      />
                    </>
                  )}

                  <YesNo
                    label="Any New Damage to Structure"
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
                        updateField(
                          "new_structure_damage_details",
                          value
                        )
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
                    onChange={(value) =>
                      updateField("bins_emptied", value)
                    }
                  />

                  <YesNo
                    label="Doors Locked"
                    value={report.doors_locked}
                    onChange={(value) =>
                      updateField("doors_locked", value)
                    }
                  />
                </div>
              )}
            </ReportSection>
          </TabsContent>

          <TabsContent value="submit">
            <ReportSection title="Submit / Finalise">
              <div className="space-y-4">
                <Notice>
                  Submitting this report will mark it as completed and
                  lock further editing.
                </Notice>

                {isSubmitted ? (
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
                    onClick={() => void submitReport()}
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 sm:w-auto"
                  >
                    Submit Report
                  </button>
                )}
              </div>
            </ReportSection>
          </TabsContent>
        </Tabs>

        <div className="flex">
          <button
            type="button"
            onClick={() => void saveReport()}
            disabled={isSubmitted || saving || !dirty}
            className="w-full rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
      {children}
    </div>
  );
}

function SoundLevelsSection({
  values,
  onChange,
}: {
  values: {
    foh: string | null;
    boxOffice: string | null;
    lake: string | null;
    cottages: string | null;
    topGate: string | null;
  };
  onChange: (
    field: "foh" | "box_office" | "lake" | "cottages" | "top_gate",
    value: string
  ) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Sound Levels
      </h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SoundLevelField
          label="FOH"
          value={values.foh}
          onChange={(value) => onChange("foh", value)}
        />

        <SoundLevelField
          label="Box Office"
          value={values.boxOffice}
          onChange={(value) => onChange("box_office", value)}
        />

        <SoundLevelField
          label="Lake"
          value={values.lake}
          onChange={(value) => onChange("lake", value)}
        />

        <SoundLevelField
          label="Cottages"
          value={values.cottages}
          onChange={(value) => onChange("cottages", value)}
        />

        <SoundLevelField
          label="Top Gate"
          value={values.topGate}
          onChange={(value) => onChange("top_gate", value)}
        />
      </div>
    </div>
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
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={false}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white disabled:opacity-60"
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
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <div className="flex gap-2">
        <input
          type="time"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />

        <button
          type="button"
          onClick={setNow}
          className="shrink-0 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700"
        >
          Now
        </button>
      </div>
    </div>
  );
}

function SoundLevelField({
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
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <input
        type="text"
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
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
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
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
        checked
          ? "border-green-500 bg-green-950/30 text-white"
          : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600"
      }`}
    >
      <span>{label}</span>

      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${
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

function formatDisplayDate(value: string | null) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
