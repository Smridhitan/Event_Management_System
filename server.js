const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/events", require("./routes/eventRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/organizer", require("./routes/organizerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/participant", require("./routes/participantRoutes"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});