export type LegacyDataRecord = Record<string, any>;

export interface ProgramData extends LegacyDataRecord {
  id: string;
  title: string;
  pdca?: LegacyDataRecord;
  years?: Record<number, LegacyDataRecord>;
  budget_categories?: LegacyDataRecord[];
}

export interface UnitData extends LegacyDataRecord {
  id: string;
  title: string;
  programs: ProgramData[];
}

export interface ProjectData extends LegacyDataRecord {
  id: string;
  title: string;
  units: UnitData[];
}
