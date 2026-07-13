import { Dispatch, SetStateAction } from "react";
import type { ShowForm, FOHStaffingAssignment, ShowEventForm } from "./types"


export interface ShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  form: ShowForm;
  setForm: React.Dispatch<React.SetStateAction<ShowForm>>;
  onSave: () => void;
  saveLabel: string;

  events: ShowEventForm[];
  setEvents: Dispatch<SetStateAction<ShowEventForm[]>>;

  crewMembers: any[];
  assignedCrewIds: string[];
  editingShowId: number | null;
  toggleCrewAssignment: (showId: number, userId: string) => Promise<void>;
  crewSearchTerm: string;
  setCrewSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  externalCrew: any[];
  assignedExternalCrewIds: number[];
  toggleExternalCrewAssignment: (
    showId: number,
    externalCrewId: number
  ) => Promise<void>;

  venues: any[];

  fohStaffing: FOHStaffingAssignment[];
  setFohStaffing: React.Dispatch<React.SetStateAction<FOHStaffingAssignment[]>>;

  documents: any[];
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  documentName: string;
  setDocumentName: React.Dispatch<React.SetStateAction<string>>;
  uploadingDocument: boolean;
  setUploadingDocument: React.Dispatch<React.SetStateAction<boolean>>;
  loadDocuments: (showId: number) => Promise<void>;
  documentActivity: any[];
  loadDocumentActivity: (showId: number) => Promise<void>;
};