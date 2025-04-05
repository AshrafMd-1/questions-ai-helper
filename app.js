const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

require("dotenv").config();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// ✅ FIXED MongoDB URI (with password encoding)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const qaSchema = new mongoose.Schema({
  question: { type: String, unique: true },
  answer: String,
});
const QA = mongoose.model("QA", qaSchema);

// POST /send – Save Q&A if unique
app.post("/send", async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer)
    return res.status(400).send("Missing question or answer");

  try {
    const exists = await QA.findOne({ question });
    if (exists) return res.status(409).send("Question already exists");

    await QA.create({ question, answer });
    res.status(201).send("Saved successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving to database");
  }
});

// GET /show – Show all entries
app.get("/show", async (req, res) => {
  try {
    const entries = await QA.find({});
    res.render("show", { entries });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving entries");
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
