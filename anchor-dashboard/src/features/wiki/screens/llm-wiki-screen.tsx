import LLMWiki from "../../../components/LLMWiki";
import type { LLMWikiProps } from "../../../components/LLMWiki";

export const LLMWikiScreen = ({
  selectedYear,
  darkMode
}: LLMWikiProps) => (
  <LLMWiki selectedYear={selectedYear} darkMode={darkMode} />
);
