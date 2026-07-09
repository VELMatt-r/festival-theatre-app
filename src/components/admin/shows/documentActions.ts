import { supabase } from "@/lib/supabase";

export async function uploadShowDocument({
  editingShowId,
  selectedFile,
  documentName,
  setUploadingDocument,
  setSelectedFile,
  setDocumentName,
  loadDocuments,
  loadDocumentActivity,
}: {
  editingShowId: number | null;
  selectedFile: File | null;
  documentName: string;
  setUploadingDocument: (value: boolean) => void;
  setSelectedFile: (value: File | null) => void;
  setDocumentName: (value: string) => void;
  loadDocuments: (showId: number) => Promise<void>;
  loadDocumentActivity: (showId: number) => Promise<void>;
}) {
  if (!editingShowId || !selectedFile) return;

  setUploadingDocument(true);

  const filePath = `${editingShowId}/${Date.now()}-${selectedFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("show_documents")
    .upload(filePath, selectedFile);

  if (uploadError) {
    console.error(uploadError);
    setUploadingDocument(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("show_documents")
    .getPublicUrl(filePath);

  const finalDocumentName = documentName || selectedFile.name;

  const { data: insertedDocument, error: insertError } = await supabase
    .from("documents")
    .insert([
      {
        show_id: editingShowId,
        name: finalDocumentName,
        file_url: publicUrlData.publicUrl,
        file_path: filePath,
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    setUploadingDocument(false);
    return;
  }

  await supabase.from("document_activity").insert([
    {
      show_id: editingShowId,
      document_id: insertedDocument.id,
      action: "uploaded",
      document_name: finalDocumentName,
      file_url: publicUrlData.publicUrl,
      performed_by: "admin",
    },
  ]);

  setSelectedFile(null);
  setDocumentName("");
  setUploadingDocument(false);

  await loadDocuments(editingShowId);
  await loadDocumentActivity(editingShowId);
}