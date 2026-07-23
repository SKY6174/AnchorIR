import { useCallback } from "react";

const DATABASE_NAME = "anchor_ir_db";
const DATABASE_VERSION = 1;
const STORE_NAME = "kv_store";

const openDashboardCache = (): Promise<IDBDatabase> =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readDashboardCache = async (key: string): Promise<string | null> => {
  try {
    const db = await openDashboardCache();
    return new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () =>
        resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("IndexedDB 읽기 실패, localStorage 폴백 시도:", error);
    return localStorage.getItem(key);
  }
};

const writeDashboardCache = async (
  key: string,
  value: string
): Promise<boolean | void> => {
  try {
    const db = await openDashboardCache();
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => {
        localStorage.removeItem(key);
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("IndexedDB 쓰기 실패, localStorage 폴백 저장 시도:", error);
    try {
      localStorage.setItem(key, value);
    } catch (fallbackError) {
      console.error(
        "localStorage 폴백 저장마저 실패했습니다 (브라우저 용량 한계 초과):",
        fallbackError
      );
    }
  }
};

const removeDashboardCache = async (
  key: string
): Promise<boolean | void> => {
  try {
    const db = await openDashboardCache();
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("IndexedDB 삭제 실패, localStorage 폴백 시도:", error);
    localStorage.removeItem(key);
  }
};

export const useDashboardCache = () => {
  const getIndexedDBCache = useCallback(
    (key: string) => readDashboardCache(key),
    []
  );

  const safeSetLocalStorage = useCallback(
    (key: string, value: string, _currentYear: number) => {
      void writeDashboardCache(key, value);
    },
    []
  );

  const removeIndexedDBCache = useCallback(
    (key: string) => removeDashboardCache(key),
    []
  );

  return {
    getIndexedDBCache,
    safeSetLocalStorage,
    removeIndexedDBCache
  };
};
