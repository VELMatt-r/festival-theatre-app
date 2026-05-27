"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  PlusCircle,
  Pencil,
  ClipboardCheckIcon,
  Activity,
} from "lucide-react";
import {
  canViewAttentionNeeded,
  canViewOutstandingTechnicalReports,
  canViewOutstandingFOHReports,
  canViewSystemActivity,
} from "@/lib/permissions";

type Show = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
};

type TimelineItem = {
  id: number;
  name: string | null;
  date_time: string | null;
  venue: string | null;
  reportSubmitted: boolean;
};

type Profile = {
  display_name: string | null;
  role: string | null;
  department: string | null;
  job_roles: string[] | null;
};

type ActivityItem = {
  id: number;
  action: string;
  description: string;
  user_name: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showsThisMonth, setShowsThisMonth] = useState(0);
  const [showsThisYear, setShowsThisYear] = useState(0);
  const [outstandingReports, setOutstandingReports] = useState(0);
  const [showsToday, setShowsToday] = useState(0);
  const [nextShows, setNextShows] = useState<Show[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<
    { message: string; href: string; action: string }[]
  >([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, role, department, job_roles")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }

    const [
      monthResult,
      yearResult,
      nextShowsResult,
      outstandingReportsResult,
      timelineResult,
      submittedReportsResult,
      activityResult,
    ] = await Promise.all([
      supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .gte("date_time", monthStart.toISOString())
        .lt("date_time", nextMonthStart.toISOString()),

      supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .gte("date_time", yearStart.toISOString())
        .lt("date_time", nextYearStart.toISOString()),

      supabase
        .from("shows")
        .select("id, name, date_time, venue")
        .gte("date_time", now.toISOString())
        .order("date_time", { ascending: true })
        .limit(3),

      supabase
        .from("show_reports")
        .select("*", { count: "exact", head: true })
        .neq("status", "submitted"),

      supabase
        .from("shows")
        .select("id, name, date_time, venue")
        .gte("date_time", todayStart.toISOString())
        .lt("date_time", tomorrowStart.toISOString())
        .order("date_time", { ascending: true }),

      supabase
        .from("show_reports")
        .select("show_id")
        .eq("status", "submitted"),

      supabase
        .from("activity_log")
        .select("id, action, description, user_name, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const submittedShowIds =
      submittedReportsResult.data?.map((report) => report.show_id) || [];

    setShowsThisMonth(monthResult.count || 0);
    setShowsThisYear(yearResult.count || 0);
    setOutstandingReports(outstandingReportsResult.count || 0);
    setShowsToday(timelineResult.data?.length || 0);
    setNextShows(nextShowsResult.data || []);

    setTimeline(
      (timelineResult.data || []).map((show) => ({
        ...show,
        reportSubmitted: submittedShowIds.includes(show.id),
      }))
    );

    setRecentActivity(activityResult.data || []);

    const dashboardAlerts: { message: string; href: string; action: string }[] =
      [];

    if ((outstandingReportsResult.count || 0) > 0) {
      dashboardAlerts.push({
        message: `${outstandingReportsResult.count} outstanding reports require attention`,
        href: "/reports",
        action: "View reports",
      });
    }

    const missingVenueShows =
      nextShowsResult.data?.filter((show) => !show.venue) || [];

    if (missingVenueShows.length > 0) {
      dashboardAlerts.push({
        message: `${missingVenueShows.length} upcoming shows are missing venue information`,
        href: "/admin/shows",
        action: "Manage shows",
      });
    }

    setAlerts(dashboardAlerts);
  }

  const displayName = profile?.display_name || "User";
  const role = profile?.role || "viewer";
  const department = profile?.department || null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_40%)]" />
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-pink-500/20 bg-white/5 p-2 shadow-lg">
              <Image
                src="/logo.png"
                alt="Festival Theatre"
                width={220}
                height={80}
                className="h-auto w-auto"
                priority
              />
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
              Welcome back, {displayName}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {new Date().toLocaleString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-200">
                {role}
              </div>

              {department && (
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
                  {department}
                </div>
              )}

              <div className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
                Operational Dashboard
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <HeroMiniStat label="Shows Today" value={showsToday} />

          {canViewOutstandingTechnicalReports(profile) && (
            <HeroMiniStat
              label="Outstanding Technical Reports"
              value={outstandingReports}
              valueClassName="text-yellow-300"
            />
          )}

          {canViewOutstandingFOHReports(profile) && (
            <HeroMiniStat
              label="Outstanding FOH Reports"
              value={0}
              valueClassName="text-yellow-300"
            />
          )}

          <HeroMiniStat label="Shows This Month" value={showsThisMonth} />
          <HeroMiniStat label="Shows This Year" value={showsThisYear} />
        </section>

        {canViewAttentionNeeded(profile) && alerts.length > 0 && (
          <section className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-yellow-500/20 p-3 text-yellow-300">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Attention Needed
                </h2>

                <p className="text-sm text-zinc-400">
                  Operational items requiring admin attention.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {alerts.map((alert, index) => (
                <Link
                  key={index}
                  href={alert.href}
                  className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4 transition hover:border-yellow-400/50"
                >
                  <p className="text-sm text-yellow-200">{alert.message}</p>

                  <span className="text-sm font-medium text-yellow-300">
                    {alert.action} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Today & Upcoming
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  The next scheduled shows.
                </p>
              </div>

              <Link
                href="/schedule"
                className="text-sm font-medium text-pink-300 hover:text-pink-200"
              >
                View schedule →
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {nextShows.map((show) => {
                const date = show.date_time ? new Date(show.date_time) : null;
                const isToday =
                  date && date.toDateString() === new Date().toDateString();

                return (
                  <Link
                    key={show.id}
                    href={`/shows/${show.id}`}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 transition hover:border-pink-500/50 hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 rounded-2xl bg-pink-500/10 px-3 py-2 text-center text-pink-300">
                        <p className="text-xs uppercase">
                          {date
                            ? date.toLocaleString("en-GB", {
                                month: "short",
                              })
                            : "---"}
                        </p>

                        <p className="text-2xl font-bold">
                          {date ? date.getDate() : "--"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">
                            {show.name || "Untitled Show"}
                          </p>

                          {isToday && (
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                              Today
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-zinc-400">
                          {show.venue || "No venue set"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-sm text-zinc-300">
                      {date
                        ? date.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </div>
                  </Link>
                );
              })}

              {nextShows.length === 0 && (
                <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                  No upcoming shows found.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-pink-300">
                Live Operations
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Today&apos;s Timeline
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Shows scheduled for today and report status.
              </p>
            </div>

            <Link
              href="/reports"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-pink-500/50 hover:text-white"
            >
              View reports
            </Link>
          </div>

          <div className="mt-8">
            {timeline.length === 0 ? (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                No operational activity scheduled for today.
              </p>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute bottom-0 left-[38px] top-0 w-px bg-zinc-800" />

                {timeline.map((item) => {
                  const date = item.date_time
                    ? new Date(item.date_time)
                    : null;

                  return (
                    <div key={item.id} className="relative flex gap-5">
                      <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-center">
                        <div>
                          <p className="text-lg font-bold text-white">
                            {date
                              ? date.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </p>

                          <p className="text-xs uppercase tracking-wide text-pink-300">
                            Show
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {item.name || "Untitled Show"}
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            {item.venue || "No venue"}
                          </p>

                          <div className="mt-3">
                            {item.reportSubmitted ? (
                              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                                Report Submitted
                              </span>
                            ) : (
                              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300">
                                Report Outstanding
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/shows/${item.id}`}
                            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                          >
                            Show Info
                          </Link>

                          <Link
                            href="/reports"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-500"
                          >
                            Reports
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {canViewSystemActivity(profile) && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl">
            <div>
              <p className="text-sm uppercase tracking-wide text-pink-300">
                System Activity
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Latest operational changes across the platform.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {recentActivity.map((activity) => {
                const config = getActivityConfig(activity.action);

                return (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-pink-500/40 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                      >
                        {config.icon}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${config.badgeClass}`}
                          >
                            {config.label}
                          </span>

                          <span className="text-xs text-zinc-500">
                            {formatActivityTime(activity.created_at)}
                          </span>
                        </div>

                        <p className="mt-2 font-medium text-white">
                          {activity.description}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {activity.user_name || "Unknown User"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {recentActivity.length === 0 && (
                <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                  No recent activity found.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}

function HeroMiniStat({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function getActivityConfig(action: string) {
  if (action === "show_added") {
    return {
      label: "Show Added",
      icon: <PlusCircle size={20} />,
      iconClass: "bg-green-500/20 text-green-300",
      badgeClass: "bg-green-500/20 text-green-300",
    };
  }

  if (action === "show_edited") {
    return {
      label: "Show Edited",
      icon: <Pencil size={20} />,
      iconClass: "bg-yellow-500/20 text-yellow-300",
      badgeClass: "bg-yellow-500/20 text-yellow-300",
    };
  }

  if (action === "report_submitted") {
    return {
      label: "Report Submitted",
      icon: <ClipboardCheckIcon size={20} />,
      iconClass: "bg-indigo-500/20 text-indigo-300",
      badgeClass: "bg-indigo-500/20 text-indigo-300",
    };
  }

  return {
    label: "Activity",
    icon: <Activity size={20} />,
    iconClass: "bg-zinc-700 text-zinc-300",
    badgeClass: "bg-zinc-800 text-zinc-300",
  };
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}