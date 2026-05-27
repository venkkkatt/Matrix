require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const communityRouter = require("./routes/communityRoutes")
const eventRouter = require("./routes/eventRoutes")

const app = express();

connectDB();

app.use(cors({
   origin: "http://localhost:5173",
   credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "API Running" });
});

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/communities", communityRouter)
app.use("/api/events", eventRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});