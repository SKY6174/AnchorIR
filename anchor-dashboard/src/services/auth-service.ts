import type { User } from "@supabase/supabase-js";
import { userRoles } from "../data/mockData";
import type { LegacyDataRecord } from "../data/mockData";
import { supabase } from "../supabaseClient";

export interface ApprovedSessionUser {
  id: string;
  loginId: string;
  name: string;
  role: LegacyDataRecord;
  role_key: string;
  uuid: string;
  email: string;
}

const APPROVED_USER_ERROR_MESSAGE = "승인된 사용자 정보를 확인할 수 없습니다. 관리자에게 문의해 주세요.";

export class ApprovedRiseUserError extends Error {
  constructor() {
    super(APPROVED_USER_ERROR_MESSAGE);
    this.name = "ApprovedRiseUserError";
  }
}

async function rejectLocalSession(): Promise<never> {
  await supabase.auth.signOut({ scope: "local" });
  throw new ApprovedRiseUserError();
}

export async function resolveApprovedRiseUser(
  authUser: Pick<User, "id" | "email">,
  requestedLoginId?: string
): Promise<ApprovedSessionUser> {
  const { data: profile, error } = await supabase
    .from("rise_users")
    .select("id, name, role_key, approved, uuid, email")
    .eq("uuid", authUser.id)
    .maybeSingle();

  const mappedRole = profile ? userRoles[profile.role_key] : undefined;
  if (
    error
    || !profile
    || profile.uuid !== authUser.id
    || !profile.approved
    || !mappedRole
  ) {
    return rejectLocalSession();
  }

  const email = profile.email || authUser.email || "";
  return {
    id: profile.id,
    loginId: requestedLoginId?.trim().toLowerCase() || email || profile.id,
    name: profile.name,
    role: mappedRole,
    role_key: profile.role_key,
    uuid: profile.uuid,
    email
  };
}

export function getApprovedRiseUserErrorMessage(error: unknown): string {
  return error instanceof ApprovedRiseUserError
    ? error.message
    : "로그인 처리 중 서버 통신 에러가 발생했습니다.";
}
