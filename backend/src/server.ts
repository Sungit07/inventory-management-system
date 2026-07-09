import app from "./app";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Inventory Management System Backend Running`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});
