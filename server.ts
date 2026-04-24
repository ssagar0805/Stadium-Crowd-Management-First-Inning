import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Location {
  id: string;
  name: string;
  category: "food" | "washroom" | "gate" | "seating" | "help";
  status: "Low" | "Medium" | "High";
  zone: "North" | "South" | "East" | "West" | "Pavilion" | "Concourse";
  count: number;
  imageUrl?: string;
  updatedAt: number;
}

// In-memory "database" with sample points for a cricket stadium
let locations: Location[] = [
  // GATES & ENTRY/EXIT
  { id: "1", name: "Main Gate 1 (North Entry)", category: "gate", status: "Low", zone: "North", count: 12, updatedAt: Date.now() },
  { id: "2", name: "Gate 3 (East Entry/Exit)", category: "gate", status: "Medium", zone: "East", count: 35, updatedAt: Date.now() },
  { id: "3", name: "South VIP Gate 5", category: "gate", status: "Low", zone: "South", count: 5, updatedAt: Date.now() },
  { id: "16", name: "West Gate 7 (Exit Only)", category: "gate", status: "Low", zone: "West", count: 0, updatedAt: Date.now() },

  // FOOD & SNACKS
  { id: "4", name: "North Food Plaza", category: "food", status: "High", zone: "North", count: 82, updatedAt: Date.now() },
  { id: "5", name: "East Concourse Snacks", category: "food", status: "Low", zone: "Concourse", count: 15, updatedAt: Date.now() },
  { id: "6", name: "Pavilion VIP Lounge", category: "food", status: "Medium", zone: "Pavilion", count: 22, updatedAt: Date.now() },
  { id: "17", name: "South Beverage Hub", category: "food", status: "Low", zone: "South", count: 8, updatedAt: Date.now() },

  // WASHROOMS
  { id: "7", name: "North Stand Washroom", category: "washroom", status: "Medium", zone: "North", count: 18, updatedAt: Date.now() },
  { id: "8", name: "West Pavilion Washroom", category: "washroom", status: "High", zone: "West", count: 42, updatedAt: Date.now() },
  { id: "9", name: "East Upper Washroom", category: "washroom", status: "Low", zone: "East", count: 4, updatedAt: Date.now() },
  { id: "18", name: "Accessible Washrooms (South)", category: "washroom", status: "Low", zone: "South", count: 2, updatedAt: Date.now() },

  // SEATING / PAVILION
  { id: "10", name: "North Upper Tier", category: "seating", status: "Medium", zone: "North", count: 55, updatedAt: Date.now() },
  { id: "11", name: "Main Pavilion Seats", category: "seating", status: "Low", zone: "Pavilion", count: 15, updatedAt: Date.now() },
  { id: "12", name: "East Stand (General)", category: "seating", status: "High", zone: "East", count: 95, updatedAt: Date.now() },

  // HELP & SAFETY
  { id: "13", name: "Main Help Desk", category: "help", status: "Low", zone: "Concourse", count: 3, updatedAt: Date.now() },
  { id: "14", name: "First Aid & Medical (East)", category: "help", status: "Low", zone: "East", count: 1, updatedAt: Date.now() },
  { id: "15", name: "Security & Police Point", category: "help", status: "Low", zone: "North", count: 2, updatedAt: Date.now() },
  { id: "19", name: "Senior Assistance Desk", category: "help", status: "Low", zone: "Pavilion", count: 1, updatedAt: Date.now() },
  { id: "20", name: "ADA Accessible Route (West)", category: "help", status: "Low", zone: "West", count: 0, updatedAt: Date.now() },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/locations", (req, res) => {
    res.json(locations);
  });

  app.post("/api/locations", (req, res) => {
    const { id, name, category, status, zone, count, imageUrl } = req.body;
    
    const index = locations.findIndex(loc => loc.id === id);
    const newLocation: Location = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      category,
      status,
      zone: zone || "North",
      count: parseInt(count) || 0,
      imageUrl,
      updatedAt: Date.now(),
    };

    if (index !== -1) {
      locations[index] = newLocation;
    } else {
      locations.push(newLocation);
    }

    res.json(newLocation);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
