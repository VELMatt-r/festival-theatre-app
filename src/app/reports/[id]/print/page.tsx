"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

import TechnicalShowReportPrint from "@/components/reports/TechnicalShowReportPrint";
import TechnicalGetInReportPrint from "@/components/reports/TechnicalGetInReportPrint";
import TechnicalRehearsalReportPrint from "@/components/reports/TechnicalRehearsalReportPrint";

export default function PrintReportPage() {
  const params = useParams();
  const reportId = Number(params.id);

  const [reportFormKey, setReportFormKey] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportType() {
      const { data, error } = await supabase
        .from("show_reports")
        .select("report_form_key")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error(
          "Load print report type failed:",
          error
        );

        setLoading(false);
        return;
      }

      setReportFormKey(
        data.report_form_key || "technical-show"
      );

      setLoading(false);
    }

    if (Number.isFinite(reportId)) {
      loadReportType();
    }
  }, [reportId]);

  if (loading) {
    return (
      <main className="p-10">
        Loading report...
      </main>
    );
  }

  if (reportFormKey === "technical-getin") {
    return (
      <TechnicalGetInReportPrint
        reportId={reportId}
      />
    );
  }

  if (reportFormKey === "technical-rehearsal") {
    return (
      <TechnicalRehearsalReportPrint
        reportId={reportId}
      />
    );
  }

  return (
    <TechnicalShowReportPrint
      reportId={reportId}
    />
  );
}