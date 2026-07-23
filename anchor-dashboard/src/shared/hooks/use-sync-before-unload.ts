import { useEffect } from "react";

export const useSyncBeforeUnload = (syncStatus: string) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (syncStatus === "syncing") {
        event.preventDefault();
        event.returnValue =
          "현재 변경 사항을 데이터베이스에 저장하는 중입니다. 저장 완료 후 새로고침해주세요.";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncStatus]);
};
