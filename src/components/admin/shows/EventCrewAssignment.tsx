"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

// =====================================================
// Types
// =====================================================

type InternalCrewMember = {
  id: string;
  display_name: string;
  department: string | null;
  job_roles: string[] | null;
  disabled: boolean | null;
};

type ExternalCrewMember = {
  id: number;
  display_name: string;
  department: string | null;
  job_roles: string[] | null;
  status: string | null;
};

type EventCrewAssignmentProps = {
  eventId: number;
};

// =====================================================
// Component
// =====================================================

export default function EventCrewAssignment({
  eventId,
}: EventCrewAssignmentProps) {
  const [internalCrew, setInternalCrew] = useState<InternalCrewMember[]>([]);
  const [externalCrew, setExternalCrew] = useState<ExternalCrewMember[]>([]);

  const [assignedInternalIds, setAssignedInternalIds] = useState<string[]>([]);
  const [assignedExternalIds, setAssignedExternalIds] = useState<number[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadCrewData();
  }, [eventId]);

  // =====================================================
  // Loading
  // =====================================================

  async function loadCrewData() {
    setLoading(true);

    const [
      internalCrewResult,
      externalCrewResult,
      assignmentResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          department,
          job_roles,
          disabled
        `)
        .eq("disabled", false)
        .order("display_name"),

      supabase
        .from("external_crew")
        .select(`
          id,
          display_name,
          department,
          job_roles,
          status
        `)
        .eq("status", "active")
        .order("display_name"),

      supabase
        .from("show_event_staff")
        .select(`
          user_id,
          external_crew_id
        `)
        .eq("show_event_id", eventId),
    ]);

    if (internalCrewResult.error) {
      console.error(
        "Failed to load internal crew:",
        internalCrewResult.error
      );
    }

    if (externalCrewResult.error) {
      console.error(
        "Failed to load external crew:",
        externalCrewResult.error
      );
    }

    if (assignmentResult.error) {
      console.error(
        "Failed to load event crew assignments:",
        assignmentResult.error
      );
    }

    setInternalCrew(
      (internalCrewResult.data || []).filter(
        (crew) => crew.department === "Technical"
      )
    );

    setExternalCrew(
      (externalCrewResult.data || []).filter(
        (crew) => crew.department === "Technical"
      )
    );

    setAssignedInternalIds(
      assignmentResult.data
        ?.filter((assignment) => assignment.user_id)
        .map((assignment) => assignment.user_id as string) || []
    );

    setAssignedExternalIds(
      assignmentResult.data
        ?.filter((assignment) => assignment.external_crew_id)
        .map(
          (assignment) => assignment.external_crew_id as number
        ) || []
    );

    setLoading(false);
  }

  // =====================================================
  // Derived Crew Lists
  // =====================================================

  const search = searchTerm.trim().toLowerCase();

  const filteredInternalCrew = useMemo(
    () =>
      internalCrew.filter((crew) =>
        crewMatchesSearch(crew, search)
      ),
    [internalCrew, search]
  );

  const filteredExternalCrew = useMemo(
    () =>
      externalCrew.filter((crew) =>
        crewMatchesSearch(crew, search)
      ),
    [externalCrew, search]
  );

  const assignedInternalCrew = filteredInternalCrew.filter((crew) =>
    assignedInternalIds.includes(crew.id)
  );

  const availableInternalCrew = filteredInternalCrew.filter(
    (crew) => !assignedInternalIds.includes(crew.id)
  );

  const assignedExternalCrew = filteredExternalCrew.filter((crew) =>
    assignedExternalIds.includes(crew.id)
  );

  const availableExternalCrew = filteredExternalCrew.filter(
    (crew) => !assignedExternalIds.includes(crew.id)
  );

  // =====================================================
  // Assignment Actions
  // =====================================================

  async function toggleInternalCrew(userId: string) {
    const updateKey = `internal-${userId}`;
    const isAssigned = assignedInternalIds.includes(userId);

    setUpdatingId(updateKey);

    if (isAssigned) {
      const { error } = await supabase
        .from("show_event_staff")
        .delete()
        .eq("show_event_id", eventId)
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Failed to remove event crew assignment:",
          error
        );

        alert(
          error.message ||
            "Failed to remove the crew assignment."
        );

        setUpdatingId(null);
        return;
      }

      setAssignedInternalIds((current) =>
        current.filter((id) => id !== userId)
      );
    } else {
      const { error } = await supabase
        .from("show_event_staff")
        .insert([
          {
            show_event_id: eventId,
            user_id: userId,
            external_crew_id: null,
          },
        ]);

      if (error) {
        console.error(
          "Failed to assign internal crew:",
          error
        );

        alert(
          error.message ||
            "Failed to assign the crew member."
        );

        setUpdatingId(null);
        return;
      }

      setAssignedInternalIds((current) => [
        ...current,
        userId,
      ]);
    }

    setUpdatingId(null);
  }

  async function toggleExternalCrew(externalCrewId: number) {
    const updateKey = `external-${externalCrewId}`;
    const isAssigned =
      assignedExternalIds.includes(externalCrewId);

    setUpdatingId(updateKey);

    if (isAssigned) {
      const { error } = await supabase
        .from("show_event_staff")
        .delete()
        .eq("show_event_id", eventId)
        .eq("external_crew_id", externalCrewId);

      if (error) {
        console.error(
          "Failed to remove external crew assignment:",
          error
        );

        alert(
          error.message ||
            "Failed to remove the external crew assignment."
        );

        setUpdatingId(null);
        return;
      }

      setAssignedExternalIds((current) =>
        current.filter((id) => id !== externalCrewId)
      );
    } else {
      const { error } = await supabase
        .from("show_event_staff")
        .insert([
          {
            show_event_id: eventId,
            user_id: null,
            external_crew_id: externalCrewId,
          },
        ]);

      if (error) {
        console.error(
          "Failed to assign external crew:",
          error
        );

        alert(
          error.message ||
            "Failed to assign the external crew member."
        );

        setUpdatingId(null);
        return;
      }

      setAssignedExternalIds((current) => [
        ...current,
        externalCrewId,
      ]);
    }

    setUpdatingId(null);
  }

  // =====================================================
  // Render
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
        <p className="text-sm text-zinc-400">
          Loading technical crew...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
      <div>
        <p className="text-sm font-medium text-zinc-200">
          Technical Crew
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Assign internal and external technical crew to this event.
        </p>
      </div>

      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search technical crew..."
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
      />

      <CrewSection
        title="Assigned Crew"
        emptyMessage="No technical crew assigned to this event."
      >
        {assignedInternalCrew.map((crew) => (
          <CrewButton
            key={`internal-${crew.id}`}
            name={crew.display_name}
            subtitle={formatRoles(crew.job_roles)}
            selected
            disabled={updatingId === `internal-${crew.id}`}
            onClick={() => toggleInternalCrew(crew.id)}
          />
        ))}

        {assignedExternalCrew.map((crew) => (
          <CrewButton
            key={`external-${crew.id}`}
            name={crew.display_name}
            subtitle={
              formatRoles(crew.job_roles) || "External Crew"
            }
            selected
            disabled={updatingId === `external-${crew.id}`}
            onClick={() => toggleExternalCrew(crew.id)}
          />
        ))}
      </CrewSection>

      <CrewSection
        title="Available Internal Crew"
        emptyMessage="No matching internal technical crew."
      >
        {availableInternalCrew.map((crew) => (
          <CrewButton
            key={`internal-${crew.id}`}
            name={crew.display_name}
            subtitle={formatRoles(crew.job_roles)}
            disabled={updatingId === `internal-${crew.id}`}
            onClick={() => toggleInternalCrew(crew.id)}
          />
        ))}
      </CrewSection>

      <CrewSection
        title="Available External Crew"
        emptyMessage="No matching external technical crew."
      >
        {availableExternalCrew.map((crew) => (
          <CrewButton
            key={`external-${crew.id}`}
            name={crew.display_name}
            subtitle={
              formatRoles(crew.job_roles) || "External Crew"
            }
            disabled={updatingId === `external-${crew.id}`}
            onClick={() => toggleExternalCrew(crew.id)}
          />
        ))}
      </CrewSection>
    </div>
  );
}

// =====================================================
// Supporting Components
// =====================================================

function CrewSection({
  title,
  emptyMessage,
  children,
}: {
  title: string;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>

      {hasChildren ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {children}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function CrewButton({
  name,
  subtitle,
  selected = false,
  disabled = false,
  onClick,
}: {
  name: string;
  subtitle?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3 text-left transition disabled:cursor-wait disabled:opacity-60 ${
        selected
          ? "border-indigo-500 bg-indigo-950/50"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
      }`}
    >
      <p className="font-medium text-white">
        {name}
      </p>

      {subtitle && (
        <p className="mt-1 text-sm text-zinc-500">
          {subtitle}
        </p>
      )}
    </button>
  );
}

// =====================================================
// Helpers
// =====================================================

function crewMatchesSearch(
  crew: {
    display_name: string;
    job_roles: string[] | null;
  },
  search: string
) {
  if (!search) return true;

  const matchesName = crew.display_name
    ?.toLowerCase()
    .includes(search);

  const matchesRole = crew.job_roles?.some((role) =>
    role.toLowerCase().includes(search)
  );

  return Boolean(matchesName || matchesRole);
}

function formatRoles(roles: string[] | null) {
  return roles?.join(", ") || "";
}