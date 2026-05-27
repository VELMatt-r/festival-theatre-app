"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  canAccessAdmin,
  canAccessDashboard,
  canAccessFOHReport,
  canAccessSchedule,
  canAccessTechnicalReport,
  canAccessTechnicalSpecifications,
} from "@/lib/permissions";

type Profile = {
  display_name: string | null;
  role: string | null;
  department: string | null;
  job_roles: string[] | null;
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userDisplay, setUserDisplay] = useState<string>("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        setUserDisplay("Signed in");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, role, department, job_roles")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      setUserDisplay(
        profileData?.display_name || user.email || "Signed in"
      );
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const userRole = profile?.role || "";
  const department = profile?.department || "";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-6 md:flex">
          <div className="flex items-center justify-center px-4 py-6">
            <Image
              src="/logo.png"
              alt="Festival Theatre"
              width={220}
              height={80}
              className="h-auto w-auto"
              priority
            />
          </div>

          <nav className="flex flex-col gap-2">
            {canAccessDashboard(profile) && (
              <Link
                href="/dashboard"
                className="rounded-lg bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
              >
                Dashboard
              </Link>
            )}

            {canAccessSchedule(profile) && (
              <Link
                href="/schedule"
                className="rounded-lg px-4 py-3 transition hover:bg-zinc-800"
              >
                Schedule
              </Link>
            )}

            {canAccessTechnicalReport(profile) && (
              <Link
                href="/reports"
                className="rounded-lg px-4 py-3 transition hover:bg-zinc-800"
              >
                Technical Reports
              </Link>
            )}

            {canAccessFOHReport(profile) && (
              <Link
                href="/foh-reports"
                className="rounded-lg px-4 py-3 transition hover:bg-zinc-800"
              >
                FOH Reports
              </Link>
            )}

            {canAccessTechnicalSpecifications(profile) && (
              <Link
                href="/tech-specs"
                className="rounded-lg px-4 py-3 transition hover:bg-zinc-800"
              >
                Technical Specifications
              </Link>
            )}

            {canAccessAdmin(profile) && (
              <Link
                href="/admin"
                className="rounded-lg px-4 py-3 transition hover:bg-zinc-800"
              >
                Admin
              </Link>
            )}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto rounded-lg bg-zinc-800 px-4 py-3 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            Log out
          </button>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Festival Season Hub</h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-zinc-800 px-4 py-2 text-sm">
                    {userDisplay}
                  </div>

                  {userRole && (
                    <div className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                      {userRole}
                    </div>
                  )}

                  {department && (
                    <div className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                      {department}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700"
                >
                  Log out
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}