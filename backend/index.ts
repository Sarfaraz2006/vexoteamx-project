import express from "express";
import cors from "cors";
import { Server as WebSocketServer } from "ws";
import { Database } from "bun:sqlite";

// Initialize SQLite database
const db = new Database("database.sqlite", { create: true });

// Create Tables
db.query(`
  CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT
  )
`).run();

db.query(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    service TEXT,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.query(`
  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    service TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Seed initial config if not present
const defaultConfig = {
  hero_title: "We Build, Automate & Scale Businesses With AI & Technology.",
  hero_desc: "I help businesses and startups streamline operations, automate workflows, build custom AI agents, and create high-converting websites that drive real results.",
  stats_projects: "50+",
  stats_clients: "30+",
  stats_experience: "5+",
  trusted_logos: ["brightwave", "NextGen SOLUTIONS", "GrowthLab", "Launchify", "VisionX", "AutomatePro"],
  services: [
    { id: 1, title: "AI Automation", desc: "Automate workflows and business operations using AI.", icon: "Zap", color: "purple" },
    { id: 2, title: "AI Agents", desc: "Custom AI agents that handle tasks, chat, bookings & support.", icon: "Bot", color: "pink" },
    { id: 3, title: "Web Development", desc: "High-performing websites that look premium & convert.", icon: "Code", color: "blue" },
    { id: 4, title: "CRM Development", desc: "Custom CRM systems to manage leads, clients and sales.", icon: "Database", color: "purple" },
    { id: 5, title: "UGC Ads", desc: "High-converting UGC ads that build trust & drive more sales.", icon: "Video", color: "pink" },
    { id: 6, title: "API Integrations", desc: "Connect tools and automate with powerful integrations.", icon: "Settings", color: "blue" }
  ],
  projects: [
    { id: 1, title: "AI Automation Platform", img: "/project_ai_automation.jpg", tag: "Click to Test Live Demo", type: "builder" },
    { id: 2, title: "Hair By Dar Salon Website", img: "/project_hair_salon.jpg", tag: "Click to Test Live Demo", type: "salon" },
    { id: 3, title: "CRM Development", img: "/project_crm.jpg", tag: "Click to Test Live Demo", type: "crm" }
  ],
  testimonials: [
    { id: 1, name: "James Carter", company: "CEO, Brightwave", quote: "VexoteamX transformed our business with AI automation. Highly recommended!", avatar: "JC", rating: 5 },
    { id: 2, name: "Sarah Mitchell", company: "Founder, NextGen", quote: "Professional, fast, and understood exactly what we needed.", avatar: "SM", rating: 5 },
    { id: 3, name: "Siddharth Sharma", company: "CTO, GrowthLab", quote: "The customized CRM system is robust and has streamlined our sales pipeline completely.", avatar: "SS", rating: 5 }
  ],
  contact_phone: "+91 87951 75243",
  contact_email: "sarfaraz.ahmad@example.com",
  contact_address: "Mumbai, India"
};

const checkConfig = db.query("SELECT * FROM config WHERE key = 'portfolio_config'").get();
if (!checkConfig) {
  db.query("INSERT INTO config (key, value) VALUES ($key, $value)").run({
    $key: "portfolio_config",
    $value: JSON.stringify(defaultConfig)
  });
}

// Express App setup
const app = express();
app.use(cors());
app.use(express.json());

// REST API Endpoints

// GET Portfolio Config
app.get("/api/config", (req, res) => {
  try {
    const row = db.query("SELECT value FROM config WHERE key = 'portfolio_config'").get() as { value: string } | undefined;
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.status(404).json({ error: "Config not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Update Portfolio Config
app.post("/api/config", (req, res) => {
  try {
    const newConfig = req.body;
    db.query("UPDATE config SET value = $value WHERE key = 'portfolio_config'").run({
      $value: JSON.stringify(newConfig)
    });
    // Broadcast config update
    broadcast({ type: "CONFIG_UPDATED", data: newConfig });
    res.json({ success: true, message: "Configuration updated successfully", config: newConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Bookings
app.get("/api/bookings", (req, res) => {
  try {
    const bookings = db.query("SELECT * FROM bookings ORDER BY created_at DESC").all();
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Booking
app.post("/api/bookings", (req, res) => {
  try {
    const { name, email, phone, service, date, time, notes } = req.body;
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ error: "Missing required booking details." });
    }
    const result = db.query(`
      INSERT INTO bookings (name, email, phone, service, date, time, notes)
      VALUES ($name, $email, $phone, $service, $date, $time, $notes)
      RETURNING *
    `).get({
      $name: name,
      $email: email || "",
      $phone: phone,
      $service: service,
      $date: date,
      $time: time,
      $notes: notes || ""
    }) as any;

    // Broadcast WebSocket Alert
    broadcast({ type: "NEW_BOOKING", data: result });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Booking Status
app.put("/api/bookings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.query("UPDATE bookings SET status = $status WHERE id = $id").run({
      $status: status,
      $id: parseInt(id)
    });
    const updated = db.query("SELECT * FROM bookings WHERE id = $id").get({ $id: parseInt(id) });
    broadcast({ type: "BOOKING_UPDATED", data: updated });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Booking
app.delete("/api/bookings/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.query("DELETE FROM bookings WHERE id = $id").run({ $id: parseInt(id) });
    res.json({ success: true, message: `Booking ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Call Requests
app.get("/api/calls", (req, res) => {
  try {
    const calls = db.query("SELECT * FROM calls ORDER BY created_at DESC").all();
    res.json(calls);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Call Request
app.post("/api/calls", (req, res) => {
  try {
    const { name, phone, service } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and Phone number are required." });
    }
    const result = db.query(`
      INSERT INTO calls (name, phone, service)
      VALUES ($name, $phone, $service)
      RETURNING *
    `).get({
      $name: name,
      $phone: phone,
      $service: service || "General Inquiry"
    }) as any;

    // Broadcast WebSocket Alert
    broadcast({ type: "NEW_CALL", data: result });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Call Status
app.put("/api/calls/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.query("UPDATE calls SET status = $status WHERE id = $id").run({
      $status: status,
      $id: parseInt(id)
    });
    const updated = db.query("SELECT * FROM calls WHERE id = $id").get({ $id: parseInt(id) });
    broadcast({ type: "CALL_UPDATED", data: updated });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Call Request
app.delete("/api/calls/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.query("DELETE FROM calls WHERE id = $id").run({ $id: parseInt(id) });
    res.json({ success: true, message: `Call request ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server
const port = 3001;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Backend API Server running at http://0.0.0.0:${port}`);
});

// Setup WebSocket Server
const wss = new WebSocketServer({ server });
const clients = new Set<any>();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("WebSocket client connected. Total clients:", clients.size);

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket client disconnected. Total clients:", clients.size);
  });
});

// Broadcast helper
function broadcast(msg: any) {
  const payload = JSON.stringify(msg);
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}