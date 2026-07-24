import { Check } from "lucide-react";

interface PdcaFeedbackToastProps {
  feedbackMsg: string;
}

export function PdcaFeedbackToast({ feedbackMsg }: PdcaFeedbackToastProps) {
  return (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
          borderRadius: "1rem"
        }}>
          <div style={{
            background: "rgba(18, 18, 23, 0.96)",
            border: "2px solid rgba(16, 185, 129, 0.8)",
            borderRadius: "1rem",
            padding: "2rem 3rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.25)",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: "0.8rem",
            color: "white",
            minWidth: "360px",
            textAlign: "center"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--success-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)",
              marginBottom: "0.2rem"
            }}>
              <Check size={24} strokeWidth={4} />
            </div>
            <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "#34d399", letterSpacing: "-0.03em" }}>설정 완료</span>
            <span style={{ fontSize: "0.92rem", color: "var(--text-secondary)", fontWeight: "600", lineHeight: "1.4" }}>{feedbackMsg}</span>
          </div>
        </div>
  );
}
