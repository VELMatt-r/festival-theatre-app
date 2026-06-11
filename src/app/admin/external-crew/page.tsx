"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type ExternalCrew = {
  id: number;
  display_name: string;
  department: string | null;
  job_roles: string[] | null;

  phone_number: string | null;
  email: string | null;
  status: string | null;
};

export default function ManageExternalCrewPage() {
  const [crew, setCrew] = useState<ExternalCrew[]>([]);
  const [search, setSearch] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("Technical");
  const [jobRole, setJobRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [editingCrew, setEditingCrew] = useState<ExternalCrew | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDepartment, setEditDepartment] = useState("Technical");
  const [editJobRole, setEditJobRole] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    loadCrew();
  }, []);

  async function loadCrew() {
    const { data, error } = await supabase
      .from("external_crew")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      alert(error.message || "Failed to load external crew.");
      return;
    }

    setCrew(data || []);
  }

  async function addCrew() {
    if (!displayName.trim()) {
      alert("Please enter a name.");
      return;
    }

    const { error } = await supabase.from("external_crew").insert([
      {
        display_name: displayName.trim(),
        department,
        job_roles: jobRole.trim() ? [jobRole.trim()] : [],
        phone_number: phoneNumber.trim() || null,
        email: email.trim() || null,
        status: "active",
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message || "Failed to add external crew.");
      return;
    }

    setDisplayName("");
    setDepartment("Technical");
    setJobRole("");
    setPhoneNumber("");
    setEmail("");

    await loadCrew();
  }

  async function toggleStatus(member: ExternalCrew) {
    const newStatus = member.status === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("external_crew")
      .update({ status: newStatus })
      .eq("id", member.id);

    if (error) {
      console.error(error);
      alert(error.message || "Failed to update crew status.");
      return;
    }

    await loadCrew();
  }

  function openEditModal(member: ExternalCrew) {
  setEditingCrew(member);
  setEditDisplayName(member.display_name || "");
  setEditDepartment(member.department || "Technical");
  setEditJobRole(member.job_roles?.join(", ") || "");
  setEditPhoneNumber(member.phone_number || "");
  setEditEmail(member.email || "");
}

async function updateCrew() {
  if (!editingCrew) return;

  if (!editDisplayName.trim()) {
    alert("Please enter a name.");
    return;
  }

  const roles = editJobRole
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("external_crew")
    .update({
      display_name: editDisplayName.trim(),
      department: editDepartment,
      job_roles: roles,
      phone_number: editPhoneNumber.trim() || null,
      email: editEmail.trim() || null,
    })
    .eq("id", editingCrew.id);

  if (error) {
    console.error(error);
    alert(error.message || "Failed to update external crew.");
    return;
  }

  setEditingCrew(null);
  await loadCrew();
}

  const filteredCrew = crew.filter((member) => {
    const value = search.toLowerCase();

    return (
      member.display_name?.toLowerCase().includes(value) ||
      member.department?.toLowerCase().includes(value) ||
      member.job_roles?.join(", ").toLowerCase().includes(value)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Manage External Crew
          </h1>

          <p className="mt-2 text-zinc-400">
            Add regular crew members who do not need user accounts.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Add External Crew</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Crew member name"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </Field>

            <Field label="Department">
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="Technical">Technical</option>
                <option value="FOH">FOH</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Role">
              <input
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
                placeholder="LX Operator, Sound No. 1, Stagehand..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </Field>

            <Field label="Phone Number">
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </Field>

            <Field label="Email">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addCrew}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            Add External Crew
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">External Crew</h2>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search external crew..."
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />
          </div>

          <div className="mt-5 space-y-3">
            {filteredCrew.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                No external crew found.
              </p>
            ) : (
              filteredCrew.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {member.display_name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {member.department || "No department"} ·{" "}
                      {member.job_roles?.join(", ") || "No role"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {member.phone_number || "No phone"} ·{" "}
                      {member.email || "No email"}
                    </p>
                  </div>

                  <div className="flex gap-2">
  <button
    type="button"
    onClick={() => openEditModal(member)}
    className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => toggleStatus(member)}
    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
      member.status === "active"
        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
    }`}
  >
    {member.status === "active" ? "Active" : "Inactive"}
  </button>
</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <Dialog open={!!editingCrew} onOpenChange={() => setEditingCrew(null)}>
  <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">
        Edit External Crew
      </DialogTitle>
    </DialogHeader>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Field label="Name">
        <input
          value={editDisplayName}
          onChange={(event) => setEditDisplayName(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />
      </Field>

      <Field label="Department">
        <select
          value={editDepartment}
          onChange={(event) => setEditDepartment(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        >
          <option value="Technical">Technical</option>
          <option value="FOH">FOH</option>
          <option value="Other">Other</option>
        </select>
      </Field>

      <Field label="Roles">
        <input
          value={editJobRole}
          onChange={(event) => setEditJobRole(event.target.value)}
          placeholder="LX Operator, Stagehand"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />
      </Field>

      <Field label="Phone Number">
        <input
          value={editPhoneNumber}
          onChange={(event) => setEditPhoneNumber(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />
      </Field>

      <Field label="Email">
        <input
          value={editEmail}
          onChange={(event) => setEditEmail(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />
      </Field>
    </div>

    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={updateCrew}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
      >
        Save Changes
      </button>

      <button
        type="button"
        onClick={() => setEditingCrew(null)}
        className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
      >
        Cancel
      </button>
    </div>
  </DialogContent>
</Dialog>
    </AppLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}