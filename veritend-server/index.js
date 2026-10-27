import "dotenv/config";
import app from "./app.js";
import { dbConnect } from "./config/database.js";
import { seedSuperAdmin } from "./config/seedSAdmin.js";

const PORT = process.env.PORT || 3030;
for (const k of [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "COOKIE_SECRET",
  "MONGOOSE_URI",
]) {
  if (!process.env[k]) {
    console.error(`Missing ${k} in .env`);
    process.exit(1);
  }
}
await dbConnect();
await seedSuperAdmin();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
