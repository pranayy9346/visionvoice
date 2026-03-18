export function errorMiddleware(error, _request, response, _next) {
  const status = error?.statusCode || 500;
  const message = error?.message || "Internal server error";
  return response.status(status).json({ error: message });
}
