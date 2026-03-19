export interface Event {
  id?: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  color: string;
  is_all_day: boolean;
  has_reminder?: boolean;
  reminder_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  color?: string;
  is_all_day: boolean;
  has_reminder?: boolean;
  reminder_minutes?: number;
}

export interface CalendarView {
  start_date: string;
  end_date: string;
}