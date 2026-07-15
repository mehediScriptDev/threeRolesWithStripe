import "dotenv/config";
import app from "./app.js";
import { config } from "./config/index.js";

async function main() {
  try {
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`GearUp server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
