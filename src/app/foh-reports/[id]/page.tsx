"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type StaffingAssignment = {
  role_key?: string;
  role_label: string;
  staff_name: string;
  notes: string;
};

export default function FOHReportPage() {
  const params = useParams();
  const reportId = Number(params.id);

  const [report, setReport] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  useEffect(() => {
    if (!report || !dirty || report.status === "submitted") return;

    const timeout = setTimeout(() => {
      saveReport();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [report, dirty]);

  async function loadReport() {
    const { data, error } = await supabase
      .from("foh_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setReport(data);
  }

  function updateField(field: string, value: any) {
    if (report?.status === "submitted") return;

    setReport((current: any) => ({
      ...current,
      [field]: value,
    }));

    setDirty(true);
  }

  function updateStaffing(
    index: number,
    field: "staff_name" | "notes",
    value: string
  ) {
    if (report?.status === "submitted") return;

    const updatedStaffing = [...(report.staffing || [])];

    updatedStaffing[index] = {
      ...updatedStaffing[index],
      [field]: value,
    };

    updateField("staffing", updatedStaffing);
  }

  async function saveReport() {
    if (!report || !dirty || report.status === "submitted") return;

    setSaving(true);

    const { error } = await supabase
      .from("foh_reports")
      .update({
        house_audience_number: report.house_audience_number,
        weather: report.weather,
        catering_provision: report.catering_provision,
        lavender_loos_cleaned: report.lavender_loos_cleaned,
        show_info_notes: report.show_info_notes,

        house_open_time: report.house_open_time,
        curtain_up_time: report.curtain_up_time,
        interval_up_time: report.interval_up_time,
        interval_down_time: report.interval_down_time,
        curtain_down_time: report.curtain_down_time,

        act_1_box_office_sound: report.act_1_box_office_sound,
        act_1_cottages_sound: report.act_1_cottages_sound,
        act_1_church_sound: report.act_1_church_sound,
        act_2_box_office_sound: report.act_2_box_office_sound,
        act_2_cottages_sound: report.act_2_cottages_sound,
        act_2_church_sound: report.act_2_church_sound,

        staffing: report.staffing || [],

        general_audience_reaction: report.general_audience_reaction,
        general_notes: report.general_notes,

        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    setSaving(false);

    if (error) {
      console.error("Save FOH report failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to save FOH report.");
      return;
    }

    setDirty(false);
    setLastSaved(new Date().toLocaleTimeString("en-GB"));
  }

  async function submitReport() {
    const confirmed = window.confirm(
      "Submit this FOH report? This will finalise the report and disable editing."
    );

    if (!confirmed) return;

    await saveReport();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let submittedByName = "Unknown User";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      submittedByName =
        profile?.display_name || user.email || "Unknown User";
    }

    const { error } = await supabase
      .from("foh_reports")
      .update({
        status: "submitted",
        submitted_by: user?.id || null,
        submitted_by_name: submittedByName,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      console.error("Submit FOH report failed:", JSON.stringify(error, null, 2));
      alert(error.message || "Failed to submit FOH report.");
      return;
    }

    await supabase.from("activity_log").insert([
      {
        action: "foh_report_submitted",
        description: `Submitted FOH report for ${report.show_name}`,
        user_id: user?.id,
        user_name: submittedByName,
        show_id: report.show_id,
        report_id: reportId,
      },
    ]);

    setReport((current: any) => ({
      ...current,
      status: "submitted",
      submitted_by: user?.id || null,
      submitted_by_name: submittedByName,
      submitted_at: new Date().toISOString(),
    }));

    setDirty(false);
    alert("FOH report submitted successfully.");
  }

  if (!report) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Loading FOH report...</p>
      </AppLayout>
    );
  }

  const isSubmitted = report.status === "submitted";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Front of House Report
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {report.show_name || "Untitled Show"}
            </h1>

            <p className="mt-2 text-zinc-400">
              {report.venue_name} ·{" "}
              {report.performance_date
                ? new Date(report.performance_date).toLocaleDateString("en-GB")
                : "No date"}{" "}
              · {report.performance_time}
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
                    ? new Date(report.submitted_at).toLocaleString("en-GB")
                    : "Unknown"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-3 text-sm text-zinc-400 md:items-end">
            <p>Status: {report.status}</p>

            <p>
              {saving
                ? "Saving..."
                : lastSaved
                ? `Last saved ${lastSaved}`
                : isSubmitted
                ? "Report locked"
                : "Autosave ready"}
            </p>

            <Link
              href={`/foh-reports/${report.id}/print`}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-500"
            >
              Print / Save PDF
            </Link>
          </div>
        </div>

        <Tabs defaultValue="show-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
            <TabsTrigger
              value="show-info"
              className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Show Info
            </TabsTrigger>

            <TabsTrigger
              value="timings"
              className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Timings
            </TabsTrigger>

            <TabsTrigger
              value="sound"
              className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Sound
            </TabsTrigger>

            <TabsTrigger
              value="staffing"
              className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Staffing
            </TabsTrigger>

            <TabsTrigger
              value="submit"
              className="rounded-xl text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Submit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="show-info">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">Show Information</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReadOnlyField
                  label="Performance"
                  value={report.show_name || ""}
                />

                <ReadOnlyField
                  label="Date and Time"
                  value={`${
                    report.performance_date
                      ? new Date(report.performance_date).toLocaleDateString(
                          "en-GB"
                        )
                      : "No date"
                  } · ${report.performance_time || "No time"}`}
                />

                <ReadOnlyField
                  label="Venue"
                  value={report.venue_name || ""}
                />

                <TextInput
                  label="House / Audience Number"
                  value={report.house_audience_number}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("house_audience_number", value)
                  }
                />

                <TextInput
                  label="Weather"
                  value={report.weather}
                  disabled={isSubmitted}
                  onChange={(value) => updateField("weather", value)}
                />

                <TextInput
                  label="Catering Provision"
                  value={report.catering_provision}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("catering_provision", value)
                  }
                />

                <YesNo
                  label="Lavender Loos Cleaned"
                  value={report.lavender_loos_cleaned}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("lavender_loos_cleaned", value)
                  }
                />

                <TextArea
                  label="Lavender Loo Notes"
                  value={report.show_info_notes}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("show_info_notes", value)
                  }
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="timings">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">Show Timings</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <TimeField
                  label="House Open"
                  value={report.house_open_time}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("house_open_time", value)
                  }
                />

                <TimeField
                  label="Curtain Up"
                  value={report.curtain_up_time}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("curtain_up_time", value)
                  }
                />

                <TimeField
                  label="Interval Up"
                  value={report.interval_up_time}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("interval_up_time", value)
                  }
                />

                <TimeField
                  label="Interval Down"
                  value={report.interval_down_time}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("interval_down_time", value)
                  }
                />

                <TimeField
                  label="Curtain Down"
                  value={report.curtain_down_time}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("curtain_down_time", value)
                  }
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="sound">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">Sound Meter Readings</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Act 1 (Box Office)"
                  value={report.act_1_box_office_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_1_box_office_sound", value)
                  }
                />

                <TextInput
                  label="Act 1 (Cottages)"
                  value={report.act_1_cottages_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_1_cottages_sound", value)
                  }
                />

                <TextInput
                  label="Act 1 (Church)"
                  value={report.act_1_church_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_1_church_sound", value)
                  }
                />

                <TextInput
                  label="Act 2 (Box Office)"
                  value={report.act_2_box_office_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_2_box_office_sound", value)
                  }
                />

                <TextInput
                  label="Act 2 (Cottages)"
                  value={report.act_2_cottages_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_2_cottages_sound", value)
                  }
                />

                <TextInput
                  label="Act 2 (Church)"
                  value={report.act_2_church_sound}
                  disabled={isSubmitted}
                  onChange={(value) =>
                    updateField("act_2_church_sound", value)
                  }
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="staffing">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">Staffing</h2>

              <div className="mt-6 space-y-4">
                {(report.staffing || []).map(
                  (item: StaffingAssignment, index: number) => (
                    <div
                      key={`${item.role_label}-${index}`}
                      className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-400">
                          {item.role_label}
                        </p>

                        <p className="mt-2 font-medium text-white">
                          {item.staff_name || "Unassigned"}
                        </p>
                      </div>

                      <input
                        value={item.staff_name || ""}
                        disabled={isSubmitted}
                        onChange={(event) =>
                          updateStaffing(
                            index,
                            "staff_name",
                            event.target.value
                          )
                        }
                        placeholder="Staff name"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <input
                        value={item.notes || ""}
                        disabled={isSubmitted}
                        onChange={(event) =>
                          updateStaffing(
                            index,
                            "notes",
                            event.target.value
                          )
                        }
                        placeholder="Notes"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  )
                )}

                {(report.staffing || []).length === 0 && (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                    No staffing assignments were attached to this report.
                  </p>
                )}
              </div>
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
                    Submitting this FOH report will mark it as completed and
                    lock further editing.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4">
                    <p className="font-medium text-green-300">
                      Report Submitted
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                      This FOH report has already been finalised.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={submitReport}
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
                  >
                    Submit FOH Report
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
            disabled={isSubmitted}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Draft
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
        {value || "—"}
      </div>
    </label>
  );
}

function TextInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <input
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  disabled?: boolean;
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
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={setNow}
          disabled={disabled}
          className="rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="md:col-span-2">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <textarea
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function YesNo({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean | null;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const checked = value === true;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
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