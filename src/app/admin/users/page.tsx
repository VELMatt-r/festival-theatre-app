"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserProfile = {
  id: string;
  display_name: string | null;
  phone_number: string | null;
  role: string;
  department: string | null;
  job_roles: string[] | null;
  disabled: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("viewer");
  const [department, setDepartment] = useState("");
  const [jobRoles, setJobRoles] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newRole, setNewRole] = useState("viewer");
  const [newDepartment, setNewDepartment] = useState("");
  const [newJobRoles, setNewJobRoles] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name");

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  function getJobRolesForDepartment(selectedDepartment: string) {
    if (selectedDepartment === "Technical") {
      return ["Technical Manager", "VE Technician", "Casual Technician"];
    }

    if (selectedDepartment === "FOH") {
      return ["Theatre Director", "House Manager", "Box Office", "Steward"];
    }

    return [];
  }

  function toggleJobRole(jobRole: string) {
    setJobRoles((current) =>
      current.includes(jobRole)
        ? current.filter((role) => role !== jobRole)
        : [...current, jobRole]
    );
  }

  function toggleNewJobRole(jobRole: string) {
    setNewJobRoles((current) =>
      current.includes(jobRole)
        ? current.filter((role) => role !== jobRole)
        : [...current, jobRole]
    );
  }

  function openEditModal(user: UserProfile) {
    setEditingUser(user);

    setDisplayName(user.display_name || "");
    setPhoneNumber(user.phone_number || "");
    setRole(user.role || "viewer");
    setDepartment(user.department || "");
    setJobRoles(user.job_roles || []);
  }

  async function saveUser() {
    if (!editingUser) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        phone_number: phoneNumber,
        role,
        department: department || null,
        job_roles: jobRoles,
      })
      .eq("id", editingUser.id);

    setSaving(false);

    if (error) {
     console.error("Update user failed:", JSON.stringify(error, null, 2));
     alert(error.message || "Failed to update user.");
      return;
    }

    setEditingUser(null);
    await loadUsers();
  }

  async function createUser() {
    setSaving(true);

    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: newEmail,
        password: newPassword,
        displayName: newDisplayName,
        phoneNumber: newPhoneNumber,
        role: newRole,
        department: newDepartment,
        job_roles: newJobRoles,
      }),
    });

    const text = await response.text();

    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      console.error("Non-JSON response:", text);
    }

    setSaving(false);

    if (!response.ok) {
      alert(result.error || "Failed to create user.");
      return;
    }

    setCreateOpen(false);

    setNewEmail("");
    setNewPassword("");
    setNewDisplayName("");
    setNewPhoneNumber("");
    setNewRole("viewer");
    setNewDepartment("");
    setNewJobRoles([]);

    await loadUsers();
  }

  async function toggleDisabledUser(user: UserProfile) {
    const response = await fetch("/api/admin/toggle-user-disabled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        disabled: !user.disabled,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to update user.");
      return;
    }

    await loadUsers();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">Users</h1>

            <p className="mt-2 text-zinc-400">
              Manage user accounts, departments and permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            Add User
          </button>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-4 rounded-xl bg-zinc-800 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">
                      {user.display_name || "Unnamed User"}
                    </p>

                    {user.disabled && (
                      <div className="rounded-full bg-red-600 px-2 py-1 text-xs font-medium uppercase">
                        Disabled
                      </div>
                    )}

                    <div className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                      {user.role}
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-zinc-400">
                    {user.phone_number || "No phone number"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.department && (
                      <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-200">
                        {user.department}
                      </span>
                    )}

                    {(user.job_roles || []).map((jobRole) => (
                      <span
                        key={jobRole}
                        className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-200"
                      >
                        {jobRole}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleDisabledUser(user)}
                    className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600"
                  >
                    {user.disabled ? "Enable" : "Disable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display Name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Phone Number"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setJobRoles([]);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="">Select Department</option>
              <option value="Technical">Technical</option>
              <option value="FOH">FOH</option>
            </select>

            {department && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Job Roles
                </p>

                <div className="space-y-2">
                  {getJobRolesForDepartment(department).map((jobRole) => (
                    <label
                      key={jobRole}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={jobRoles.includes(jobRole)}
                        onChange={() => toggleJobRole(jobRole)}
                        className="h-4 w-4"
                      />

                      {jobRole}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="admin">Admin</option>
              <option value="technical_crew">Technical Crew</option>
              <option value="technical_viewer">Technical Viewer</option>
              <option value="foh_crew">FOH Crew</option>
              <option value="foh_viewer">FOH Viewer</option>
            </select>

            <button
              type="button"
              onClick={saveUser}
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save User"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add User</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <input
              value={newDisplayName}
              onChange={(event) => setNewDisplayName(event.target.value)}
              placeholder="Display Name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <input
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              placeholder="Temporary Password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <input
              value={newPhoneNumber}
              onChange={(event) => setNewPhoneNumber(event.target.value)}
              placeholder="Phone Number"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            />

            <select
              value={newDepartment}
              onChange={(event) => {
                setNewDepartment(event.target.value);
                setNewJobRoles([]);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="">Select Department</option>
              <option value="Technical">Technical</option>
              <option value="FOH">FOH</option>
            </select>

            {newDepartment && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Job Roles
                </p>

                <div className="space-y-2">
                  {getJobRolesForDepartment(newDepartment).map((jobRole) => (
                    <label
                      key={jobRole}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={newJobRoles.includes(jobRole)}
                        onChange={() => toggleNewJobRole(jobRole)}
                        className="h-4 w-4"
                      />

                      {jobRole}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
            >
              <option value="admin">Admin</option>
              <option value="technical_crew">Technical Crew</option>
              <option value="technical_viewer">Technical Viewer</option>
              <option value="foh_crew">FOH Crew</option>
              <option value="foh_viewer">FOH Viewer</option>
            </select>

            <button
              type="button"
              onClick={createUser}
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}