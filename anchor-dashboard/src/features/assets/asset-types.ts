export type LegacyAssetRecord = Record<string, any>;

export interface SpaceReservation {
  id?: number | string;
  space_name: string;
  reserved_date: string;
  start_time: string;
  end_time: string;
  dept: string;
  reserver_name: string;
  actual_user_name?: string;
  purpose?: string;
  status: string;
  created_at?: string;
}

export interface Equipment {
  id?: number | string;
  name: string;
  spec?: string;
  dept_name?: string;
  qty?: number;
  status?: string;
  price?: number;
  acquired_date?: string;
  location?: string;
  mng_person?: string;
  note?: string;
}

export interface AssetManagerProps {
  currentRole?: any;
  currentUser?: any;
  activeSubTab?: string;
  onChangeSubTab?: (subTab: string) => void;
  darkMode?: boolean;
  selectedYear?: number | string;
}

export interface ReservationFormData {
  space_name: string;
  reserved_date: string;
  start_time: string;
  end_time: string;
  dept: string;
  custom_dept: string;
  reserver_name: string;
  actual_user_name: string;
  purpose: string;
  status: string;
}
