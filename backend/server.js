const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "supersecret123"; // Change in real project

app.use(cors());
app.use(bodyParser.json());

// 🔗 Connect to MongoDB (make sure MongoDB is running locally or use MongoDB Atlas)
mongoose
    .connect("mongodb://127.0.0.1:27017/myapp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error(err));

// 👤 User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model("User", UserSchema);

// ➡️ Signup Route
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // hash password
        const hashed = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashed });
        await user.save();

        res.json({ success: true, message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ➡️ Login Route
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Test route
app.get("/api", (req, res) => {
    res.send("Backend API with MongoDB 🚀");
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
