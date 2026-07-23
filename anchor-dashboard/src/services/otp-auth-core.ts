export type OtpChannel = "email" | "sms";

export interface OtpFeatureConfig {
  emailEnabled: boolean;
  emailProviderReady: boolean;
  smsEnabled: boolean;
  smsProviderReady: boolean;
  resendCooldownMs: number;
  maxVerifyFailures: number;
}

export interface OtpAuthUser {
  id: string;
  email?: string | null;
}

interface OtpClientError {
  message: string;
}

export interface OtpAuthClient {
  signInWithOtp(
    credentials:
      | { email: string; options: { shouldCreateUser: false } }
      | { phone: string; options: { shouldCreateUser: false } }
  ): Promise<{ error: OtpClientError | null }>;
  verifyOtp(
    credentials:
      | { email: string; token: string; type: "email" }
      | { phone: string; token: string; type: "sms" }
  ): Promise<{
    data: { user: OtpAuthUser | null; session: unknown | null };
    error: OtpClientError | null;
  }>;
}

export type OtpErrorCode =
  | "feature_disabled"
  | "provider_not_configured"
  | "invalid_destination"
  | "invalid_token"
  | "cooldown_active"
  | "too_many_attempts"
  | "request_failed"
  | "verification_failed";

const GENERIC_OTP_ERROR_MESSAGE = "인증을 완료할 수 없습니다. 입력값을 확인하거나 잠시 후 다시 시도해 주세요.";

export class OtpAuthError extends Error {
  constructor(
    public readonly code: OtpErrorCode,
    message = GENERIC_OTP_ERROR_MESSAGE
  ) {
    super(message);
    this.name = "OtpAuthError";
  }
}

function readBoolean(value: string | number | boolean | undefined): boolean {
  return value === true || value === "true";
}

function readPositiveInteger(value: string | number | boolean | undefined, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function createOtpFeatureConfig(env: Record<string, string | boolean | number | undefined>): OtpFeatureConfig {
  return {
    emailEnabled: readBoolean(env.VITE_ENABLE_EMAIL_OTP),
    emailProviderReady: readBoolean(env.VITE_EMAIL_OTP_PROVIDER_READY),
    smsEnabled: readBoolean(env.VITE_ENABLE_SMS_OTP),
    smsProviderReady: readBoolean(env.VITE_SMS_OTP_PROVIDER_READY),
    resendCooldownMs: readPositiveInteger(env.VITE_OTP_RESEND_COOLDOWN_MS, 60_000),
    maxVerifyFailures: readPositiveInteger(env.VITE_OTP_MAX_VERIFY_FAILURES, 5)
  };
}

export function normalizeOtpEmail(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new OtpAuthError("invalid_destination");
  }
  return normalized;
}

export function normalizeE164Phone(value: string, defaultCountryCode = "82"): string {
  const compact = value.trim().replace(/[()\s.-]/g, "");
  let digits: string;

  if (compact.startsWith("+")) {
    digits = compact.slice(1);
  } else if (compact.startsWith("00")) {
    digits = compact.slice(2);
  } else if (compact.startsWith("0")) {
    digits = `${defaultCountryCode}${compact.slice(1)}`;
  } else {
    digits = compact;
  }

  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    throw new OtpAuthError("invalid_destination");
  }
  return `+${digits}`;
}

export function maskOtpDestination(channel: OtpChannel, destination: string): string {
  if (channel === "email") {
    const [local, domain] = destination.split("@");
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
  }
  return `${destination.slice(0, 4)}${"*".repeat(Math.max(1, destination.length - 8))}${destination.slice(-4)}`;
}

interface AttemptState {
  lastRequestedAt?: number;
  verifyFailures: number;
}

export class OtpAttemptGuard {
  private readonly attempts = new Map<string, AttemptState>();

  constructor(
    private readonly cooldownMs: number,
    private readonly maxVerifyFailures: number,
    private readonly now: () => number = Date.now
  ) {}

  assertCanRequest(key: string): void {
    const state = this.attempts.get(key);
    if (state?.lastRequestedAt !== undefined && this.now() - state.lastRequestedAt < this.cooldownMs) {
      throw new OtpAuthError("cooldown_active");
    }
  }

  recordRequest(key: string): number {
    const requestedAt = this.now();
    const state = this.attempts.get(key) ?? { verifyFailures: 0 };
    state.lastRequestedAt = requestedAt;
    this.attempts.set(key, state);
    return requestedAt + this.cooldownMs;
  }

  assertCanVerify(key: string): void {
    if ((this.attempts.get(key)?.verifyFailures ?? 0) >= this.maxVerifyFailures) {
      throw new OtpAuthError("too_many_attempts");
    }
  }

  recordVerifyFailure(key: string): void {
    const state = this.attempts.get(key) ?? { verifyFailures: 0 };
    state.verifyFailures += 1;
    this.attempts.set(key, state);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export interface OtpRequestResult {
  maskedDestination: string;
  retryAt: number;
}

export interface OtpAuthService<TApprovedUser> {
  requestOtp(input: { channel: OtpChannel; destination: string }): Promise<OtpRequestResult>;
  verifyOtp(input: { channel: OtpChannel; destination: string; token: string }): Promise<TApprovedUser>;
}

function assertChannelReady(channel: OtpChannel, config: OtpFeatureConfig): void {
  const enabled = channel === "email" ? config.emailEnabled : config.smsEnabled;
  const providerReady = channel === "email" ? config.emailProviderReady : config.smsProviderReady;
  if (!enabled) throw new OtpAuthError("feature_disabled", "현재 사용할 수 없는 인증 방식입니다.");
  if (!providerReady) throw new OtpAuthError("provider_not_configured", "인증 제공자 설정이 완료되지 않았습니다.");
}

function normalizeDestination(channel: OtpChannel, destination: string): string {
  return channel === "email" ? normalizeOtpEmail(destination) : normalizeE164Phone(destination);
}

export function createOtpAuthService<TApprovedUser>(
  client: OtpAuthClient,
  resolveApprovedUser: (user: OtpAuthUser, requestedLoginId?: string) => Promise<TApprovedUser>,
  config: OtpFeatureConfig,
  guard = new OtpAttemptGuard(config.resendCooldownMs, config.maxVerifyFailures)
): OtpAuthService<TApprovedUser> {
  return {
    async requestOtp({ channel, destination }) {
      assertChannelReady(channel, config);
      const normalized = normalizeDestination(channel, destination);
      const key = `${channel}:${normalized}`;
      guard.assertCanRequest(key);

      const credentials = channel === "email"
        ? { email: normalized, options: { shouldCreateUser: false as const } }
        : { phone: normalized, options: { shouldCreateUser: false as const } };
      const { error } = await client.signInWithOtp(credentials);
      if (error) throw new OtpAuthError("request_failed");

      return {
        maskedDestination: maskOtpDestination(channel, normalized),
        retryAt: guard.recordRequest(key)
      };
    },

    async verifyOtp({ channel, destination, token }) {
      assertChannelReady(channel, config);
      const normalized = normalizeDestination(channel, destination);
      const key = `${channel}:${normalized}`;
      guard.assertCanVerify(key);

      if (!/^\d{6,8}$/.test(token.trim())) {
        guard.recordVerifyFailure(key);
        throw new OtpAuthError("invalid_token");
      }

      const credentials = channel === "email"
        ? { email: normalized, token: token.trim(), type: "email" as const }
        : { phone: normalized, token: token.trim(), type: "sms" as const };
      const { data, error } = await client.verifyOtp(credentials);
      if (error || !data.user || !data.session) {
        guard.recordVerifyFailure(key);
        throw new OtpAuthError("verification_failed");
      }

      const approvedUser = await resolveApprovedUser(
        data.user,
        channel === "email" ? normalized : undefined
      );
      guard.reset(key);
      return approvedUser;
    }
  };
}

export function getOtpErrorMessage(error: unknown): string {
  return error instanceof OtpAuthError ? error.message : GENERIC_OTP_ERROR_MESSAGE;
}
