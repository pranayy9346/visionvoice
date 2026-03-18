import { startServer } from "./src/app.js";

startServer()
  .then(() => {
    // Server is running, graceful shutdown will be handled by signal listeners
  })
  .catch((error) => {
    console.error("Fatal error during startup:", error.message || error);
    process.exit(1);
  });
