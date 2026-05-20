import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden md:flex sticky top-0 h-screen w-64 border-r border-zinc-800 bg-zinc-900 flex-col p-6">

          <h1 className="text-2xl font-bold mb-10">
            Festival Theatre
          </h1>

          <nav className="flex flex-col gap-2">

            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-800 px-4 py-3 hover:bg-zinc-700 transition"
            >
              Dashboard
            </Link>

            <Link
              href="/schedule"
              className="rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
            >
              Schedule
            </Link>

            <Link
              href="/reports"
              className="rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
            >
              Reports
            </Link>

            <Link
              href="/venues"
              className="rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
            >
              Venues
            </Link>

            <Link
              href="/crew"
              className="rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
            >
              Crew
            </Link>

            <Link
              href="/admin"
              className="rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
            >
              Admin
            </Link>

          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">

          <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 px-6 py-4">
            <div className="flex items-center justify-between">

              <h2 className="text-xl font-semibold">
                Festival Theatre
              </h2>

              <div className="rounded-full bg-zinc-800 px-4 py-2 text-sm">
                Matt
              </div>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>

        </div>
      </div>
    </main>
  );
}