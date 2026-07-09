import type { EventType } from "@/lib/eventStyles";

export type ShowForm = {
  name: string;
  venue: string;
  venue_id: number | null;

  event_type: EventType;
  cancelled: boolean;
  date_time: Date | null;
  crew_call: string;
  arrival_time: string;
  running_time: string;

  contact_name: string;
  contact_role: string;
  phone_number: string;
  email_address: string;
  company_vehicles: string;

  lawn_seating: boolean;
  notes: string;
};

export type FOHStaffingAssignment = {
  id?: number;
  show_id?: number;
  role_key: string;
  role_label: string;
  staff_name: string;
  notes: string;
};