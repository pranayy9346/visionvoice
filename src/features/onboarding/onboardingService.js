import { completeOnboarding } from "../../services/apiService";

export async function submitOnboarding(payload) {
  return completeOnboarding(payload);
}
