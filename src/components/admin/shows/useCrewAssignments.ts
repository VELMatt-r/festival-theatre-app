export function useCrewAssignments({
  crewMembers,
  externalCrew,
  assignedCrewIds,
  assignedExternalCrewIds,
  crewSearchTerm,
}: {
  crewMembers: any[];
  externalCrew: any[];
  assignedCrewIds: string[];
  assignedExternalCrewIds: number[];
  crewSearchTerm: string;
}) {
  const search = crewSearchTerm.toLowerCase();

  const activeCrewMembers = crewMembers.filter((crew) => crew.disabled !== true);

  const technicalCrew = activeCrewMembers.filter((crew) => {
    const matchesSearch =
      crew.display_name?.toLowerCase().includes(search) ||
      crew.job_roles?.some((role: string) =>
        role.toLowerCase().includes(search)
      );

    return crew.department === "Technical" && matchesSearch;
  });

  const fohCrew = activeCrewMembers.filter((crew) =>
    crew.department?.toLowerCase().includes("foh")
  );

  const assignedCrew = technicalCrew.filter((crew) =>
    assignedCrewIds.includes(crew.id)
  );

  const availableCrew = technicalCrew.filter(
    (crew) => !assignedCrewIds.includes(crew.id)
  );

  const technicalExternalCrew = externalCrew.filter((crew) => {
    const matchesSearch =
      crew.display_name?.toLowerCase().includes(search) ||
      crew.job_roles?.some((role: string) =>
        role.toLowerCase().includes(search)
      );

    return crew.department === "Technical" && matchesSearch;
  });

  const assignedExternalCrew = technicalExternalCrew.filter((crew) =>
    assignedExternalCrewIds.includes(crew.id)
  );

  const availableExternalCrew = technicalExternalCrew.filter(
    (crew) => !assignedExternalCrewIds.includes(crew.id)
  );

  return {
    assignedCrew,
    availableCrew,
    assignedExternalCrew,
    availableExternalCrew,
    fohCrew,
  };
}