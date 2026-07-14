"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type ShowReport = Record<string, any>;

type UseShowReportOptions = {
  reportId: number;
  reportLabel: string;

  getUpdatePayload: (
    report: ShowReport
  ) => Record<string, unknown>;

  getActivityDescription?: (
    report: ShowReport
  ) => string;
};

export function useShowReport({
  reportId,
  reportLabel,
  getUpdatePayload,
  getActivityDescription,
}: UseShowReportOptions) {
  const [report, setReport] =
    useState<ShowReport | null>(null);

  const [requiresOpeningChecks, setRequiresOpeningChecks] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);

      const { data, error } = await supabase
        .from("show_reports")
        .select(`
          *,
          venues (
            requires_opening_checks
          )
        `)
        .eq("id", reportId)
        .single();

      if (error) {
        console.error(
          `Load ${reportLabel} report failed:`,
          error
        );

        setLoading(false);
        return;
      }

      setReport(data);

      setRequiresOpeningChecks(
        data.venues?.requires_opening_checks || false
      );

      setLoading(false);
    }

    if (Number.isFinite(reportId)) {
      loadReport();
    }
  }, [reportId, reportLabel]);

  const updateField = useCallback(
    (field: string, value: unknown) => {
      setReport((current) => {
        if (!current || current.status === "submitted") {
          return current;
        }

        return {
          ...current,
          [field]: value,
        };
      });

      if (report?.status !== "submitted") {
        setDirty(true);
      }
    },
    [report?.status]
  );

  const saveReport = useCallback(
    async (force = false) => {
      if (!report) {
        return false;
      }

      if (report.status === "submitted") {
        return false;
      }

      if (!dirty && !force) {
        return true;
      }

      setSaving(true);

      const { error } = await supabase
        .from("show_reports")
        .update({
          ...getUpdatePayload(report),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      setSaving(false);

      if (error) {
        console.error(
          `Save ${reportLabel} report failed:`,
          error
        );

        alert(
          error.message ||
            `Failed to save ${reportLabel} report.`
        );

        return false;
      }

      setDirty(false);

      setLastSaved(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      return true;
    },
    [
      report,
      dirty,
      reportId,
      reportLabel,
      getUpdatePayload,
    ]
  );

  useEffect(() => {
    if (
      !report ||
      !dirty ||
      report.status === "submitted"
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveReport();
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [report, dirty, saveReport]);

  const submitReport = useCallback(async () => {
    if (!report) return;

    const confirmed = window.confirm(
      "Submit this report? This will finalise the report and disable editing."
    );

    if (!confirmed) return;

    const saved = await saveReport(true);

    if (!saved) {
      return;
    }

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
        profile?.display_name ||
        user.email ||
        "Unknown User";
    }

    const submittedAt = new Date().toISOString();

    const { error } = await supabase
      .from("show_reports")
      .update({
        status: "submitted",
        submitted_by: user?.id || null,
        submitted_by_name: submittedByName,
        submitted_at: submittedAt,
        updated_at: submittedAt,
      })
      .eq("id", reportId);

    if (error) {
      console.error(
        `Submit ${reportLabel} report failed:`,
        error
      );

      alert(
        error.message ||
          `Failed to submit ${reportLabel} report.`
      );

      return;
    }

    const description = getActivityDescription
      ? getActivityDescription(report)
      : `Submitted ${reportLabel} report for ${
          report.show_name || "Unknown Event"
        }`;

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert([
        {
          action: "report_submitted",
          description,
          user_id: user?.id || null,
          user_name: submittedByName,
          show_id: report.show_id,
          report_id: reportId,
        },
      ]);

    if (activityError) {
      console.error(
        "Create report activity entry failed:",
        activityError
      );
    }

    setReport((current) =>
      current
        ? {
            ...current,
            status: "submitted",
            submitted_by: user?.id || null,
            submitted_by_name: submittedByName,
            submitted_at: submittedAt,
          }
        : current
    );

    setDirty(false);

    alert("Report submitted successfully.");
  }, [
    report,
    reportId,
    reportLabel,
    saveReport,
    getActivityDescription,
  ]);

  return {
    report,
    loading,
    saving,
    dirty,
    lastSaved,
    requiresOpeningChecks,
    isSubmitted: report?.status === "submitted",
    updateField,
    saveReport,
    submitReport,
  };
}