import RequireAuth from "@/components/auth/RequireAuth";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}