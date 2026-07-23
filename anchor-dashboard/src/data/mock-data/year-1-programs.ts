import type { ProgramData } from "./data-types";
import { YEAR_1_PROGRAMS_A } from "./year-1-programs-a";
import { YEAR_1_PROGRAMS_B } from "./year-1-programs-b";
import { YEAR_1_PROGRAMS_C } from "./year-1-programs-c";
import { YEAR_1_PROGRAMS_D } from "./year-1-programs-d";

export const YEAR_1_PROGRAMS: Record<string, ProgramData[]> = {
  "A1가": YEAR_1_PROGRAMS_A["A1가"],
  "A2": YEAR_1_PROGRAMS_A["A2"],
  "B1": YEAR_1_PROGRAMS_B["B1"],
  "C1": YEAR_1_PROGRAMS_C["C1"],
  "D3": YEAR_1_PROGRAMS_D["D3"],
  "D1": YEAR_1_PROGRAMS_D["D1"],
  "B4": YEAR_1_PROGRAMS_B["B4"],
  "B2": YEAR_1_PROGRAMS_B["B2"],
  "B3": YEAR_1_PROGRAMS_B["B3"],
  "D2": YEAR_1_PROGRAMS_D["D2"],
  "C2": YEAR_1_PROGRAMS_C["C2"],
  "A3": YEAR_1_PROGRAMS_A["A3"],
};
