import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import ordersRoutes from "./routes/orders.route"; // Import orders routes
import authRoutes from "./routes/auth.route"; // Import auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Middleware to serve static files
    app.use(express.static("public"));

    // Middleware to parse JSON
    app.use(express.json());

    // Middleware to handle CORS
    app.use(cors());

    // API routes
    app.use("/api/orders", ordersRoutes); // Attach orders routes
    app.use("/api/auth", authRoutes); // Attach auth routes

    // Catch-all route for serving frontend
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit with failure
  }
}

main();
