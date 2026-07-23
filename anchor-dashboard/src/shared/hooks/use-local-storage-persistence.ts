import { useEffect } from "react";

export const useLocalStorageValue = (
  key: string,
  value: string | number
) => {
  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);
};

export const useLocalStorageJson = (key: string, value: unknown) => {
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
};

export const useOptionalLocalStorageValue = (
  key: string,
  value: string | null | undefined
) => {
  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);
};

export const useOptionalLocalStorageJson = (
  key: string,
  value: unknown
) => {
  useEffect(() => {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);
};

export const useActiveTabPersistence = (activeTab: string) => {
  useEffect(() => {
    if (activeTab !== "survey_respond") {
      localStorage.setItem("anchor_active_tab", activeTab);
    }
  }, [activeTab]);
};
