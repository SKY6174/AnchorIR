import assert from "node:assert/strict";
import test from "node:test";
import {
  createOtpAuthService,
  createOtpFeatureConfig,
  normalizeE164Phone,
  OtpAttemptGuard,
  OtpAuthError,
  type OtpAuthClient
} from "./otp-auth-core.js";

const READY_CONFIG = createOtpFeatureConfig({
  VITE_ENABLE_EMAIL_OTP: "true",
  VITE_EMAIL_OTP_PROVIDER_READY: "true",
  VITE_ENABLE_SMS_OTP: "true",
  VITE_SMS_OTP_PROVIDER_READY: "true",
  VITE_OTP_RESEND_COOLDOWN_MS: "60000",
  VITE_OTP_MAX_VERIFY_FAILURES: "2"
});

test("OTP 기능은 명시적으로 설정하지 않으면 모두 비활성화된다", () => {
  const config = createOtpFeatureConfig({});
  assert.equal(config.emailEnabled, false);
  assert.equal(config.emailProviderReady, false);
  assert.equal(config.smsEnabled, false);
  assert.equal(config.smsProviderReady, false);
});

test("국내 휴대전화 번호를 E.164 형식으로 정규화한다", () => {
  assert.equal(normalizeE164Phone("010-1234-5678"), "+821012345678");
  assert.equal(normalizeE164Phone("+82 10 1234 5678"), "+821012345678");
  assert.throws(() => normalizeE164Phone("123"), OtpAuthError);
});

test("재전송 cooldown과 검증 실패 한도를 메모리에서 제한한다", () => {
  let now = 1_000;
  const guard = new OtpAttemptGuard(60_000, 2, () => now);
  guard.recordRequest("email:user@example.com");
  assert.throws(
    () => guard.assertCanRequest("email:user@example.com"),
    (error) => error instanceof OtpAuthError && error.code === "cooldown_active"
  );

  now += 60_000;
  assert.doesNotThrow(() => guard.assertCanRequest("email:user@example.com"));
  guard.recordVerifyFailure("email:user@example.com");
  guard.recordVerifyFailure("email:user@example.com");
  assert.throws(
    () => guard.assertCanVerify("email:user@example.com"),
    (error) => error instanceof OtpAuthError && error.code === "too_many_attempts"
  );
});

test("OTP 요청은 기존 사용자만 허용하고 목적지를 마스킹한다", async () => {
  let captured: unknown;
  const client: OtpAuthClient = {
    async signInWithOtp(credentials) {
      captured = credentials;
      return { error: null };
    },
    async verifyOtp() {
      throw new Error("not used");
    }
  };
  const service = createOtpAuthService(client, async () => ({ approved: true }), READY_CONFIG);
  const result = await service.requestOtp({
    channel: "email",
    destination: " Person@Example.com "
  });

  assert.deepEqual(captured, {
    email: "person@example.com",
    options: { shouldCreateUser: false }
  });
  assert.equal(result.maskedDestination, "pe****@example.com");
});

test("SMS OTP 검증 후 공통 승인 사용자 resolver를 통과시킨다", async () => {
  const client: OtpAuthClient = {
    async signInWithOtp() {
      return { error: null };
    },
    async verifyOtp(credentials) {
      assert.deepEqual(credentials, {
        phone: "+821012345678",
        token: "123456",
        type: "sms"
      });
      return {
        data: {
          user: { id: "auth-user-id", email: "person@example.com" },
          session: { access_token: "redacted" }
        },
        error: null
      };
    }
  };
  const service = createOtpAuthService(
    client,
    async (user) => ({ id: user.id, approved: true }),
    READY_CONFIG
  );

  assert.deepEqual(
    await service.verifyOtp({
      channel: "sms",
      destination: "010-1234-5678",
      token: "123456"
    }),
    { id: "auth-user-id", approved: true }
  );
});

test("provider 준비가 확인되지 않으면 외부 OTP 호출 전에 안전하게 중단한다", async () => {
  let called = false;
  const client: OtpAuthClient = {
    async signInWithOtp() {
      called = true;
      return { error: null };
    },
    async verifyOtp() {
      throw new Error("not used");
    }
  };
  const service = createOtpAuthService(
    client,
    async () => ({ approved: true }),
    { ...READY_CONFIG, smsProviderReady: false }
  );

  await assert.rejects(
    service.requestOtp({ channel: "sms", destination: "010-1234-5678" }),
    (error) => error instanceof OtpAuthError && error.code === "provider_not_configured"
  );
  assert.equal(called, false);
});
