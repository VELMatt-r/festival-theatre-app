export type SystemRole =
  | "admin"
  | "technical_crew"
  | "technical_viewer"
  | "foh_crew"
  | "foh_viewer";

export type Department = "Technical" | "FOH" | null;

export type JobRole =
  | "Technical Manager"
  | "VE Technician"
  | "Casual Technician"
  | "Theatre Director"
  | "House Manager"
  | "Box Office"
  | "Steward";

export type PermissionProfile = {
  role: SystemRole | string | null;
  department: Department | string | null;
  job_roles: JobRole[] | string[] | null;
};

/* Role checks */

export function isAdmin(profile: PermissionProfile | null) {
  return profile?.role === "admin";
}

export function isTechnicalCrew(profile: PermissionProfile | null) {
  return profile?.role === "technical_crew";
}

export function isTechnicalViewer(profile: PermissionProfile | null) {
  return profile?.role === "technical_viewer";
}

export function isFOHCrew(profile: PermissionProfile | null) {
  return profile?.role === "foh_crew";
}

export function isFOHViewer(profile: PermissionProfile | null) {
  return profile?.role === "foh_viewer";
}

export function isTechnical(profile: PermissionProfile | null) {
  return isTechnicalCrew(profile) || isTechnicalViewer(profile);
}

export function isFOH(profile: PermissionProfile | null) {
  return isFOHCrew(profile) || isFOHViewer(profile);
}

export function hasJobRole(
  profile: PermissionProfile | null,
  jobRole: JobRole
) {
  return profile?.job_roles?.includes(jobRole) || false;
}

/* Dashboard widgets */

export function canViewHeroSection(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewShowsToday(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewShowsThisMonth(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewShowsThisYear(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewOutstandingTechnicalReports(
  profile: PermissionProfile | null
) {
  return isAdmin(profile) || isTechnicalCrew(profile);
}

export function canViewOutstandingFOHReports(
  profile: PermissionProfile | null
) {
  return isAdmin(profile) || isFOHCrew(profile);
}

export function canViewAttentionNeeded(profile: PermissionProfile | null) {
  return isAdmin(profile);
}

export function canViewTodayUpcoming(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewLiveOperations(profile: PermissionProfile | null) {
  return !!profile;
}

export function canViewSystemActivity(profile: PermissionProfile | null) {
  return isAdmin(profile) || isTechnicalCrew(profile) || isFOHCrew(profile);
}

/* Page access */

export function canAccessDashboard(profile: PermissionProfile | null) {
  return !!profile;
}

export function canAccessSchedule(profile: PermissionProfile | null) {
  return !!profile;
}

export function canAccessTechnicalReport(profile: PermissionProfile | null) {
  return isAdmin(profile) || isTechnicalCrew(profile);
}

export function canAccessFOHReport(profile: PermissionProfile | null) {
  return isAdmin(profile) || isFOHCrew(profile);
}

export function canAccessTechnicalSpecifications(
  profile: PermissionProfile | null
) {
  return (
    isAdmin(profile) ||
    isTechnicalCrew(profile) ||
    isTechnicalViewer(profile)
  );
}

export function canAccessAdmin(profile: PermissionProfile | null) {
  return isAdmin(profile);
}

/* Schedule show info modals */

export function canViewTechnicalShowInfo(profile: PermissionProfile | null) {
  return (
    isAdmin(profile) ||
    isTechnicalCrew(profile) ||
    isTechnicalViewer(profile)
  );
}

export function canViewFOHShowInfo(profile: PermissionProfile | null) {
  return isAdmin(profile) || isFOHCrew(profile) || isFOHViewer(profile);
}