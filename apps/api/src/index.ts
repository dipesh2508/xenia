import express from "express";
import cookieParser from "cookie-parser";

import userRouter from "@/routes/user.route";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (_, res) => {
  res.send("Hello World");
});

// Routes
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
