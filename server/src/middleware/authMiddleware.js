import { USER_ID_FALLBACK } from "../modules/user/userProfile.service.js";

export function authMiddleware(request, _response, next) {
  const fromHeader = request.get?.("x-user-id");
  const fromBody = request.body?.userId;

  if (typeof fromBody === "string" && fromBody.trim()) {
    request.userId = fromBody.trim();
  } else if (typeof fromHeader === "string" && fromHeader.trim()) {
    request.userId = fromHeader.trim();
  } else {
    request.userId = USER_ID_FALLBACK;
  }

  next();
}
