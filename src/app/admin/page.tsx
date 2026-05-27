import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

export default function AdminPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>

          <p className="mt-2 text-zinc-400">
            Manage the operational data and system settings for the theatre.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/shows"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500 hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold text-white">Shows</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Add, edit and manage show details, crew assignments and documents.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500 hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold text-white">Users</h2>

            <p className="mt-2 text-sm text-zinc-400">
              View app users, roles and profile information.
            </p>
          </Link>
          <Link
          href="/admin/crew"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500 hover:bg-zinc-800">
            <h2 className="text-xl font-semibold text-white">
              Crew
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Manage crew records and operational contact information.
            </p>
            </Link>
        <Link
        href="/admin/venues"
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500 hover:bg-zinc-800">
          <h2 className="text-xl font-semibold text-white">
            Venues
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Manage venue records, technical contacts and operational notes.
              </p>
</Link>
        </div>
      </div>
    </AppLayout>
  );
}