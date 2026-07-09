import { TabsContent } from "@/components/ui/tabs";

export default function DocumentsTab({
  editingShowId,
  documents,
  documentActivity,
  selectedFile,
  setSelectedFile,
  documentName,
  setDocumentName,
  uploadingDocument,
  uploadDocument,
}: {
  editingShowId: number | null;
  documents: any[];
  documentActivity: any[];
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  documentName: string;
  setDocumentName: (name: string) => void;
  uploadingDocument: boolean;
  uploadDocument: () => Promise<void>;
}) {
  return (
    <TabsContent value="documents">
        <div className="mt-6 space-y-5">
              {!editingShowId && <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">Save the show first, then edit it to upload documents.</div>}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Upload Document</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Document name" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white" />
                  <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  console.log("Selected file:", file);
                  setSelectedFile(file);
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                />
                </div>
                <button type="button" disabled={!editingShowId || !selectedFile || uploadingDocument} onClick={uploadDocument} className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {uploadingDocument ? "Uploading..." : "Upload Document"}
                </button>
              </div>

              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                    <span className="font-medium text-white">{document.name}</span>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600">View</a>
                  </div>
                ))}
                {documents.length === 0 && <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">No documents uploaded yet.</p>}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">Activity Log</h3>
                <div className="mt-4 space-y-3">
                  {documentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                      <span className="font-medium text-white">{activity.performed_by || "admin"}</span> {activity.action} <span className="font-medium text-white">{activity.document_name}</span>
                      <p className="mt-1 text-xs text-zinc-500">{new Date(activity.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ))}
                  {documentActivity.length === 0 && <p className="text-sm text-zinc-500">No document activity yet.</p>}
                </div>
            </div>
        </div>
    </TabsContent>
  );
}