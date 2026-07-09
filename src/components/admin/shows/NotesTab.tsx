import { TabsContent } from "@/components/ui/tabs";
import Field from "./Field";
import type { ShowForm } from "./types";

export default function NotesTab({
    form,
    setForm,
}: {
    form: ShowForm;
    setForm: (form: ShowForm) => void;
}) {
    return(
<TabsContent value="notes">
            <div className="mt-6 space-y-6">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                <input type="checkbox" checked={form.lawn_seating} onChange={(e) => setForm({ ...form, lawn_seating: e.target.checked })} className="h-5 w-5" />
                <span className="text-sm text-zinc-300">Lawn Seating</span>
              </label>

              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={8} placeholder="Add operational notes..." className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" />
              </Field>
            </div>
          </TabsContent>
    );
}