import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import ShowTab from "./ShowTab";
import NotesTab from "./NotesTab";
import VisitingCompanyTab from "./VisitingCompanyTab";
import TechnicalCrewTab from "./TechnicalCrewTab";
import FOHStaffingTab from "./FOHStaffingTab";
import DocumentsTab from "./DocumentsTab";

import type { ShowDialogProps } from "./ShowDialog.types";
import { useCrewAssignments } from "./useCrewAssignments";
import { uploadShowDocument } from "./documentActions";

import type {
  ShowForm,
  FOHStaffingAssignment,
} from "./types";


// =====================================================
// Constants
// =====================================================

const TAB_TRIGGER_CLASS =
  "shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black sm:text-base";

// =====================================================
// Component
// =====================================================

export default function ShowDialog({
  open,
  onOpenChange,
  title,
  form,
  setForm,
  onSave,
  saveLabel,

  crewMembers,
  assignedCrewIds,
  editingShowId,
  toggleCrewAssignment,
  crewSearchTerm,
  setCrewSearchTerm,

  externalCrew,
  assignedExternalCrewIds,
  toggleExternalCrewAssignment,

  venues,

  fohStaffing,
  setFohStaffing,

  documents,
  selectedFile,
  setSelectedFile,
  documentName,
  setDocumentName,
  uploadingDocument,
  setUploadingDocument,
  loadDocuments,
  documentActivity,
  loadDocumentActivity,
}: ShowDialogProps) {
  // =====================================================
  // Derived Crew Data
  // =====================================================

  const {
    assignedCrew,
    availableCrew,
    assignedExternalCrew,
    availableExternalCrew,
    fohCrew,
  } = useCrewAssignments({
    crewMembers,
    externalCrew,
    assignedCrewIds,
    assignedExternalCrewIds,
    crewSearchTerm,
  });

  // =====================================================
  // Document Actions
  // =====================================================

  function uploadDocument() {
    return uploadShowDocument({
      editingShowId,
      selectedFile,
      documentName,
      setUploadingDocument,
      setSelectedFile,
      setDocumentName,
      loadDocuments,
      loadDocumentActivity,
    });
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="show" className="mt-4">
          <TabNavigation />

          <ShowTab form={form} setForm={setForm} venues={venues}/>

          <VisitingCompanyTab form={form} setForm={setForm} />

          <NotesTab form={form} setForm={setForm} />

          <TechnicalCrewTab
            crewSearchTerm={crewSearchTerm}
            setCrewSearchTerm={setCrewSearchTerm}
            editingShowId={editingShowId}
            assignedCrew={assignedCrew}
            availableCrew={availableCrew}
            assignedExternalCrew={assignedExternalCrew}
            availableExternalCrew={availableExternalCrew}
            toggleCrewAssignment={toggleCrewAssignment}
            toggleExternalCrewAssignment={toggleExternalCrewAssignment}
          />

          <FOHStaffingTab
            editingShowId={editingShowId}
            fohStaffing={fohStaffing}
            setFohStaffing={setFohStaffing}
            fohCrew={fohCrew}
          />

          <DocumentsTab
            editingShowId={editingShowId}
            documents={documents}
            documentActivity={documentActivity}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            documentName={documentName}
            setDocumentName={setDocumentName}
            uploadingDocument={uploadingDocument}
            uploadDocument={uploadDocument}
          />
        </Tabs>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
          >
            {saveLabel}
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// Tab Navigation
// =====================================================

function TabNavigation() {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2">
      <TabsList className="flex h-auto w-max min-w-full gap-1 rounded-xl bg-zinc-800 p-1">
        <TabsTrigger value="show" className={TAB_TRIGGER_CLASS}>
          Show
        </TabsTrigger>

        <TabsTrigger value="company" className={TAB_TRIGGER_CLASS}>
          <span className="hidden sm:inline">Visiting Company</span>
          <span className="sm:hidden">Company</span>
        </TabsTrigger>

        <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS}>
          Notes
        </TabsTrigger>

        <TabsTrigger value="crew" className={TAB_TRIGGER_CLASS}>
          <span className="hidden sm:inline">Technical Crew</span>
          <span className="sm:hidden">Tech</span>
        </TabsTrigger>

        <TabsTrigger value="foh" className={TAB_TRIGGER_CLASS}>
          <span className="hidden sm:inline">FOH Staffing</span>
          <span className="sm:hidden">FOH</span>
        </TabsTrigger>

        <TabsTrigger value="documents" className={TAB_TRIGGER_CLASS}>
          <span className="hidden sm:inline">Documents</span>
          <span className="sm:hidden">Docs</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}