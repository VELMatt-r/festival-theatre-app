import AppLayout from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            Upcoming Shows
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            12
          </h3>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            Reports Submitted
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            48
          </h3>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            Active Venues
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            7
          </h3>
        </div>
      </div>
    </AppLayout>
  );
}