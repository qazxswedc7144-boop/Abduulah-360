import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { UAParser } from "ua-parser-js";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

// JWT Secrets (Use env or defaults for demo)
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_123";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_123";

interface UserPayload {
  userId: string;
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Rate Limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts, please try again later",
  });

  // --- Middleware ---

  const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as UserPayload;
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  const authorize = (action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      if (req.user.permissions.includes(action) || req.user.role === "admin") {
        next();
      } else {
        res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
    };
  };

  // --- Auth Routes ---

  app.post("/auth/login", loginLimiter, async (req, res) => {
    const { email, password, deviceName } = req.body;

    // 1. Validate credentials (Simulated for now, in real app check DB)
    // For demo purposes, we'll look up the user in Firestore
    let userSnap = await db.collection("users").where("email", "==", email).limit(1).get();

    // Auto-provision first admin if it's the user's email
    if (userSnap.empty && email === 'qazxswedc7144@gmail.com') {
      const newUser = {
        email,
        role: 'ministry_admin',
        permissions: [
          'access_admin_dashboard',
          'manage_users',
          'manage_facilities',
          'view_reports',
          'view_patient',
          'create_patient',
          'edit_patient',
          'view_prescription',
          'create_prescription',
          'dispense_medication',
          'upload_lab_result',
          'view_radiology',
          'upload_lab_request'
        ],
        name: 'System Admin',
        createdAt: new Date().toISOString()
      };
      await db.collection('users').add(newUser);
      userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    }

    if (userSnap.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userData = userSnap.docs[0].data();
    // In a real app, you'd check hashed password:
    // const isValid = await bcrypt.compare(password, userData.password);
    // if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const userId = userSnap.docs[0].id;
    const role = userData.role;
    const permissions = userData.permissions || [];

    // 2. Generate tokens
    const accessToken = jwt.sign(
      { userId, role, permissions },
      JWT_ACCESS_SECRET,
      { expiresIn: role === "ministry_admin" ? "5m" : "15m" }
    );

    const refreshToken = jwt.sign(
      { userId },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 3. Store refreshToken in Firestore: /sessions
    const parser = new UAParser(req.headers["user-agent"]);
    const device = deviceName || parser.getDevice().model || "Unknown Device";
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    await db.collection("sessions").add({
      userId,
      refreshToken,
      device,
      ip,
      createdAt: new Date().toISOString(),
    });

    // Set cookies
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "none" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none" });

    res.json({
      accessToken,
      refreshToken,
      user: { userId, email, role, permissions }
    });
  });

  app.post("/auth/refresh", async (req, res) => {
    const { refreshToken } = req.body || req.cookies;

    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

      // Check if exists in DB
      const sessionSnap = await db.collection("sessions")
        .where("userId", "==", decoded.userId)
        .where("refreshToken", "==", refreshToken)
        .limit(1)
        .get();

      if (sessionSnap.empty) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Token Rotation
      const userSnap = await db.collection("users").doc(decoded.userId).get();
      if (!userSnap.exists) return res.status(401).json({ error: "User not found" });

      const userData = userSnap.data()!;
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, role: userData.role, permissions: userData.permissions || [] },
        JWT_ACCESS_SECRET,
        { expiresIn: userData.role === "ministry_admin" ? "5m" : "15m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Delete old session and create new one
      await db.collection("sessions").doc(sessionSnap.docs[0].id).delete();
      
      const parser = new UAParser(req.headers["user-agent"]);
      await db.collection("sessions").add({
        userId: decoded.userId,
        refreshToken: newRefreshToken,
        device: parser.getDevice().model || "Unknown Device",
        ip: req.ip || "127.0.0.1",
        createdAt: new Date().toISOString(),
      });

      res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: "none" });
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "none" });

      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  });

  app.post("/auth/logout", async (req, res) => {
    const { refreshToken } = req.body || req.cookies;

    if (refreshToken) {
      const sessionSnap = await db.collection("sessions")
        .where("refreshToken", "==", refreshToken)
        .limit(1)
        .get();
      
      if (!sessionSnap.empty) {
        await db.collection("sessions").doc(sessionSnap.docs[0].id).delete();
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  });

  // --- API Gateway Protected Routes ---

  const apiGateway = express.Router();
  apiGateway.use(verifyToken);

  // Regional Node Data
  const regions = [
    { id: "sanaa", name: "Sana'a", role: "Primary", status: "Active", load: 72, latency: "12ms" },
    { id: "aden", name: "Aden", role: "Failover", status: "Active", load: 45, latency: "18ms" },
    { id: "hadramout", name: "Hadramout", role: "Regional Node", status: "Active", load: 30, latency: "25ms" },
    { id: "taiz", name: "Taiz", role: "Regional Node", status: "Active", load: 55, latency: "22ms" },
    { id: "hodeidah", name: "Hodeidah", role: "Regional Node", status: "Active", load: 40, latency: "20ms" },
    { id: "ibb", name: "Ibb", role: "Regional Node", status: "Active", load: 38, latency: "24ms" },
    { id: "mahra", name: "Mahra", role: "Regional Node", status: "Active", load: 15, latency: "35ms" },
  ];

  apiGateway.get("/infrastructure/regions", authorize("view_reports"), (req, res) => {
    res.json(regions);
  });

  apiGateway.get("/infrastructure/health", authorize("access_admin_dashboard"), (req, res) => {
    res.json({
      status: "Operational",
      uptime: "99.99%",
      activeNodes: regions.filter(r => r.status === "Active").length,
      totalCapacity: "1.2 PB",
      currentLoad: "48%",
      lastSync: new Date().toISOString()
    });
  });

  apiGateway.get("/analytics/national", authorize("view_reports"), (req, res) => {
    res.json({
      totalCitizens: 30500000,
      activeHealthIDs: 24800000,
      hospitalLoad: 68,
      diseaseSpread: [
        { name: "Malaria", cases: 12500, trend: "down" },
        { name: "Cholera", cases: 4200, trend: "stable" },
        { name: "COVID-19", cases: 150, trend: "down" },
        { name: "Dengue", cases: 8900, trend: "up" }
      ],
      regionalDistribution: regions.map(r => ({
        region: r.name,
        patients: Math.floor(Math.random() * 5000000) + 1000000
      }))
    });
  });

  app.use("/api-gateway", apiGateway);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zero Trust NDHS Infrastructure running on http://localhost:${PORT}`);
  });
}

startServer();
