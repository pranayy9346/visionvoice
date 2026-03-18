import { startServer } from "./src/app.js";

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
