const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

// connect database
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

console.log("Auth routes loaded");

/* ROUTES */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/clubs", require("./routes/clubRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));

/* CREATE HTTP SERVER */
const server = http.createServer(app);

/* INITIALIZE SOCKET */
initSocket(server);

/* TEST ROUTES */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/test", (req, res) => {
  res.send("Test route working");
});

/* START SERVER */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});