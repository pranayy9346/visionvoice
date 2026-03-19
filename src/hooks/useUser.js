import { useMemo } from "react";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import useAuth from "./useAuth";
import { buildDisplayEmail, buildDisplayName } from "../utils/helpers";

export default function useUser() {
  const { user } = useClerkUser();
  const { profile } = useAuth();

  return useMemo(
    () => ({
      user,
      profile,
      displayName: buildDisplayName(user, profile),
      displayEmail: buildDisplayEmail(user, profile),
    }),
    [profile, user],
  );
}
