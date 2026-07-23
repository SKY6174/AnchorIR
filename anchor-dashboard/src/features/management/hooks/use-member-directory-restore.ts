import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  LegacyAppRecord,
  RiseMemberInsert
} from "../../../app/app-types";
import { INITIAL_MEMBERS } from "../../../app/app-seed-data";
import { supabase } from "../../../supabaseClient";
import {
  fetchRiseMembers,
  upsertRiseMembers
} from "../services/member-service";

type MemberDirectoryRestoreOptions = {
  currentUser: LegacyAppRecord | null;
  setMembers: Dispatch<SetStateAction<LegacyAppRecord[]>>;
  sanitizeMemberForDb: (
    member: LegacyAppRecord | null | undefined
  ) => RiseMemberInsert | null;
  onSessionExpired: () => void;
};

export const useMemberDirectoryRestore = ({
  currentUser,
  setMembers,
  sanitizeMemberForDb,
  onSessionExpired
}: MemberDirectoryRestoreOptions) => {
  useEffect(() => {
    if (
      !currentUser ||
      currentUser.role?.id === "GUEST" ||
      currentUser.role === "GUEST"
    ) {
      return;
    }

    const fetchDbMembers = async () => {
      try {
        const { data, error } = await fetchRiseMembers();

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((member) => ({
            ...member,
            status:
              member.status === "재직중"
                ? "참여중"
                : member.status === "퇴직"
                  ? "미참여"
                  : member.status || "참여중"
          }));
          setMembers(formatted);
        } else {
          console.log(
            "Supabase members empty. Seeding initial data..."
          );
          const cleanedSeed = INITIAL_MEMBERS
            .map((member) =>
              sanitizeMemberForDb({
                ...member,
                startDate:
                  member.startDate ||
                  member.hireDate ||
                  "2026-03-01",
                endDate: member.endDate || "",
                status: member.status || "참여중"
              })
            )
            .filter(
              (member): member is RiseMemberInsert => member !== null
            );

          const runSeeding = async () => {
            try {
              const {
                data: { session }
              } = await supabase.auth.getSession();
              if (session) {
                const { error: seedError } =
                  await upsertRiseMembers(cleanedSeed);
                if (seedError) {
                  console.warn(
                    "Seeding initial members failed (RLS blocked):",
                    seedError.message
                  );
                }
              } else {
                console.log(
                  "Skipping DB write, offline/guest local fallback applied."
                );
              }
            } catch (seedError) {
              console.warn(
                "Silent seeding exception caught:",
                seedError
              );
            }
            setMembers(cleanedSeed);
          };
          void runSeeding();
        }
      } catch (error) {
        console.error(
          "Supabase rise_members table sync failed, fallback to localStorage cache:",
          error
        );

        const errorRecord = error as LegacyAppRecord;
        const status = errorRecord?.status;
        const code = String(errorRecord?.code || "");
        const message = String(errorRecord?.message || "");
        if (
          status === 401 ||
          status === 403 ||
          code === "PGRST301" ||
          code === "42501" ||
          message.includes("JWT") ||
          message.includes("claims") ||
          message.includes("expired") ||
          message.includes("permission denied") ||
          message.includes("security policy")
        ) {
          console.warn(
            ">>> [Supabase Members 동기화 중 세션 만료 감지] 자동으로 로그아웃 처리를 유도합니다. <<<",
            error
          );
          alert(
            "보안 세션이 만료되었거나 데이터베이스 인증 오류가 발생했습니다. 안전한 데이터 저장을 위해 확인을 누르시면 자동 로그아웃 후 다시 로그인 화면으로 이동합니다."
          );
          onSessionExpired();
          return;
        }

        const saved = localStorage.getItem("anchor_members");
        if (saved) {
          try {
            setMembers(JSON.parse(saved));
          } catch (restoreError) {
            console.error(
              "Failed to restore members from localStorage:",
              restoreError
            );
          }
        }
      }
    };

    void fetchDbMembers();
  // oxlint-disable-next-line react/exhaustive-deps -- approved-user changes own member restoration; sanitizer and logout callback identity must not refetch or reseed members.
  }, [currentUser]);
};
