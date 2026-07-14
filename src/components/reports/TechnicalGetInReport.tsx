"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useCallback } from "react";
import { useShowReport } from "./useShowReport";
import ReportOpeningChecks from "./ReportOpeningChecks";
import ReportClosingChecks from "./ReportClosingChecks";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type TechnicalGetInReportProps = {
  reportId: number;
};

const TAB_TRIGGER_CLASS =
  "shrink-0 rounded-xl px-4 py-2 text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white";

export default function TechnicalGetInReport({
  reportId,
}: TechnicalGetInReportProps) {
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
    lx_working: currentReport.lx_working,
    pa_working: currentReport.pa_working,
    dressing_rooms_set_up:
      currentReport.dressing_rooms_set_up,
    additional_equipment_on_site:
      currentReport.additional_equipment_on_site,
    opening_comments:
      currentReport.opening_comments,

    arrival_time: currentReport.arrival_time,
    departure_time: currentReport.departure_time,

    technical_issues_venue:
      currentReport.technical_issues_venue,
    technical_issues_company:
      currentReport.technical_issues_company,
    health_safety_incidents:
      currentReport.health_safety_incidents,
    general_comments:
      currentReport.general_comments,

    sides_closed: currentReport.sides_closed,
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
    bins_emptied: currentReport.bins_emptied,
    doors_locked: currentReport.doors_locked,
  }),
  []
);

const {
  report,
  loading,
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
  reportLabel: "Get-in",
  getUpdatePayload,
  getActivityDescription: (currentReport) =>
    `Submitted Get-in report for ${
      currentReport.show_name || "Unknown Event"
    }`,
});

  if (loading || !report) {
    return (
      <AppLayout>
        <p className="text-zinc-400">
          Loading Get-in report...
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          report={report}
          saving={saving}
          dirty={dirty}
          lastSaved={lastSaved}
        />

        <Tabs
          defaultValue="opening"
          className="space-y-6"
        >
          <div className="-mx-2 overflow-x-auto px-2 pb-1">
            <TabsList className="flex w-max min-w-full gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
              <TabsTrigger
                value="opening"
                className={TAB_TRIGGER_CLASS}
              >
                <span className="hidden sm:inline">
                  Opening Checks
                </span>

                <span className="sm:hidden">
                  Opening
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="timings"
                className={TAB_TRIGGER_CLASS}
              >
                Timings
              </TabsTrigger>

              <TabsTrigger
                value="notes"
                className={TAB_TRIGGER_CLASS}
              >
                Notes
              </TabsTrigger>

              <TabsTrigger
                value="closing"
                className={TAB_TRIGGER_CLASS}
              >
                <span className="hidden sm:inline">
                  Closing Checks
                </span>

                <span className="sm:hidden">
                  Closing
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="submit"
                className={TAB_TRIGGER_CLASS}
              >
                Submit
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="opening">
            <ReportSection title="Opening Checks">
              <ReportOpeningChecks
                report={report}
                requiresOpeningChecks={
                  requiresOpeningChecks
                }
                onChange={updateField}
              />
            </ReportSection>
          </TabsContent>

          <TabsContent value="timings">
            <ReportSection title="Timings">
              <div className="grid gap-4 md:grid-cols-2">
                <TimeField
                  label="Arrival Time"
                  value={report.arrival_time}
                  onChange={(value) =>
                    updateField("arrival_time", value)
                  }
                />

                <TimeField
                  label="Departure Time"
                  value={report.departure_time}
                  onChange={(value) =>
                    updateField("departure_time", value)
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
                    updateField(
                      "technical_issues_venue",
                      value
                    )
                  }
                />

                <TextArea
                  label="Technical Issues (Company)"
                  value={report.technical_issues_company}
                  onChange={(value) =>
                    updateField(
                      "technical_issues_company",
                      value
                    )
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
                    updateField(
                      "general_comments",
                      value
                    )
                  }
                />
              </div>
            </ReportSection>
          </TabsContent>

          <TabsContent value="closing">
            <ReportSection title="Closing Checks">
              <ReportClosingChecks
                report={report}
                requiresOpeningChecks={
                  requiresOpeningChecks
                }
                onChange={updateField}
              />
            </ReportSection>
          </TabsContent>

          <TabsContent value="submit">
            <ReportSection title="Submit / Finalise">
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-medium text-white">
                    Ready to submit?
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    Submitting this report will mark it as
                    completed and lock further editing.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4">
                    <p className="font-medium text-green-300">
                      Report Submitted
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                      This report has already been
                      finalised.
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
            disabled={
              isSubmitted ||
              saving ||
              !dirty
            }
            className="w-full rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving
              ? "Saving..."
              : "Save Draft"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

// =====================================================
// Header
// =====================================================

function ReportHeader({
  report,
  saving,
  dirty,
  lastSaved,
}: {
  report: any;
  saving: boolean;
  dirty: boolean;
  lastSaved: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide text-zinc-400">
          Technical Get-in Report
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {report.show_name || "Untitled Show"}
        </h1>

        <p className="mt-2 text-zinc-400">
          {report.venue_name || "No venue"} ·{" "}
          {formatDate(report.performance_date)} ·{" "}
          {report.performance_time || "No time"}
        </p>

        {report.status === "submitted" && (
          <div className="mt-3 rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-sm text-zinc-300">
            <p className="font-medium text-green-300">
              Submitted Report
            </p>

            <p className="mt-1">
              Submitted by{" "}
              {report.submitted_by_name || "Unknown"}
            </p>

            <p>
              Submitted at{" "}
              {report.submitted_at
                ? new Date(
                    report.submitted_at
                  ).toLocaleString("en-GB")
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
  );
}

// =====================================================
// Supporting Components
// =====================================================

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>
    </section>
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
          className="shrink-0 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700"
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
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <textarea
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={5}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
      />
    </label>
  );
}

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}