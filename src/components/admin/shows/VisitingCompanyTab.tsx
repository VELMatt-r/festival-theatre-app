import { TabsContent } from "@/components/ui/tabs";

import Field from "./Field";
import TimeOnlyField from "./TimeOnlyField";

import type { ShowForm } from "./types";

export default function VisitingCompanyTab({
    form,
    setForm,
}: {
    form: ShowForm,
    setForm: (form: ShowForm) => void;
}) {
    return (
        <TabsContent value="company">
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <TimeOnlyField label="Arrival Time" value={form.arrival_time} onChange={(value) => setForm({ ...form, arrival_time: value })} />
                      <Field label="Contact Name"><input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Alex Morgan" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
                      <Field label="Contact Role"><input value={form.contact_role} onChange={(e) => setForm({ ...form, contact_role: e.target.value })} placeholder="Tour Manager" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
                      <Field label="Phone Number"><input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="07700 900123" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
                      <Field label="Email Address"><input value={form.email_address} onChange={(e) => setForm({ ...form, email_address: e.target.value })} placeholder="alex@example.com" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field>
                      <div className="md:col-span-2"><Field label="Company Vehicles"><input value={form.company_vehicles} onChange={(e) => setForm({ ...form, company_vehicles: e.target.value })} placeholder="1 van, 2 cars. Include registrations where possible." className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" /></Field></div>
                    </div>
                  </TabsContent>
    )
}