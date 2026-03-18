export function requestLogging(request, _response, next) {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const path = request.path;
  console.log(`[${timestamp}] ${method} ${path}`);
  next();
}

export function errorMiddleware(error, request, response, _next) {
  const timestamp = new Date().toISOString();
  const status = error?.statusCode || 500;
  const message = error?.message || "Internal server error";
  const path = request?.path || "unknown";
  const method = request?.method || "unknown";

  // Log error for debugging
  if (status >= 500) {
    console.error(
      `[${timestamp}] ERROR ${method} ${path} - Status ${status}:`,
      error,
    );
  } else {
    console.warn(
      `[${timestamp}] WARN ${method} ${path} - Status ${status}: ${message}`,
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const responseMessage =
    isProduction && status >= 500 ? "Internal server error" : message;

  return response.status(status).json({ error: responseMessage });
}
