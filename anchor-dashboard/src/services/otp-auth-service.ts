import { supabase } from "../supabaseClient";
import { resolveApprovedRiseUser } from "./auth-service";
import {
  createOtpAuthService,
  createOtpFeatureConfig,
  type OtpAuthClient
} from "./otp-auth-core";

const otpConfig = createOtpFeatureConfig(import.meta.env);

const otpClient: OtpAuthClient = {
  signInWithOtp: (credentials) => supabase.auth.signInWithOtp(credentials),
  verifyOtp: async (credentials) => {
    const { data, error } = await supabase.auth.verifyOtp(credentials);
    return {
      data: {
        user: data.user,
        session: data.session
      },
      error
    };
  }
};

export const otpFeatureConfig = Object.freeze(otpConfig);

export const otpAuthService = createOtpAuthService(
  otpClient,
  (user, requestedLoginId) => resolveApprovedRiseUser({
    id: user.id,
    email: user.email ?? undefined
  }, requestedLoginId),
  otpConfig
);

export {
  getOtpErrorMessage,
  maskOtpDestination,
  normalizeE164Phone,
  normalizeOtpEmail,
  OtpAuthError
} from "./otp-auth-core";
export type { OtpChannel, OtpRequestResult } from "./otp-auth-core";
