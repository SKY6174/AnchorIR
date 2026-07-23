import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  resolveApprovedRiseUser,
  type ApprovedSessionUser
} from "../../../services/auth-service";
import { supabase } from "../../../supabaseClient";

type ApprovedAuthSessionOptions = {
  setCurrentUser: (user: ApprovedSessionUser | null) => void;
};

export const useApprovedAuthSession = ({
  setCurrentUser
}: ApprovedAuthSessionOptions) => {
  useEffect(() => {
    let active = true;

    const restoreRiseUser = async (session: Session | null) => {
      if (!session?.user) {
        if (active) setCurrentUser(null);
        localStorage.removeItem("anchor_logged_in_user");
        return;
      }

      try {
        const restoredUser = await resolveApprovedRiseUser(session.user);
        localStorage.setItem(
          "anchor_logged_in_user",
          JSON.stringify(restoredUser)
        );
        if (active) setCurrentUser(restoredUser);
      } catch {
        localStorage.removeItem("anchor_logged_in_user");
        if (active) setCurrentUser(null);
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Supabase session restore failed:", error);
        return;
      }
      void restoreRiseUser(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("anchor_logged_in_user");
          if (active) setCurrentUser(null);
        } else if (event === "USER_UPDATED") {
          void restoreRiseUser(session);
        }
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [setCurrentUser]);
};
