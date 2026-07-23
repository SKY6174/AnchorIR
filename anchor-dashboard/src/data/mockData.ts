// Compatibility facade: keep existing imports stable while data lives in domain modules.
export type { LegacyDataRecord, ProgramData, UnitData, ProjectData } from "./mock-data/data-types";
export { initialProjectsData } from "./mock-data/initial-projects";
export { userRoles } from "./mock-data/user-roles";
export { YEAR_1_PROGRAMS } from "./mock-data/year-1-programs";
export { Y1_UNIT_META } from "./mock-data/year-1-unit-meta";
