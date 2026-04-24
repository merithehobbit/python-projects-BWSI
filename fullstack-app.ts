/* =========================
   SCHEMA (DATABASE)
========================= */

import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  dataUrl: text("data_url").notNull(),
  filter: text("filter").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;


/* =========================
   STORAGE (DATABASE LOGIC)
========================= */

import { db } from "./db";
import { images } from "./schema";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {
  async getImages() {
    return db.select().from(images).orderBy(desc(images.createdAt));
  }

  async getImage(id: number) {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async createImage(image: InsertImage) {
    const [created] = await db.insert(images).values(image).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();


/* =========================
   API ROUTES
========================= */

import express from "express";
import { storage } from "./storage";
import { api } from "./routes";
import { z } from "zod";

export function registerRoutes(app: express.Express) {
  app.use(express.json({ limit: "10mb" }));

  app.get(api.images.list.path, async (_req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  app.get(api.images.get.path, async (req, res) => {
    const image = await storage.getImage(Number(req.params.id));
    if (!image) return res.status(404).json({ message: "Not found" });
    res.json(image);
  });

  app.post(api.images.create.path, async (req, res) => {
    try {
      const input = api.images.create.input.parse(req.body);
      const image = await storage.createImage(input);
      res.status(201).json(image);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
}


/* =========================
   ROUTES CONFIG
========================= */

export const api = {
  images: {
    list: { method: "GET", path: "/api/images" },
    get: { method: "GET", path: "/api/images/:id" },
    create: {
      method: "POST",
      path: "/api/images",
      input: insertImageSchema,
    },
  },
};


/* =========================
   FRONTEND (REACT APP)
========================= */

import { useState, useRef } from "react";

const FILTERS = [
  { name: "Normal", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Invert", value: "invert(100%)" },
  { name: "Blur", value: "blur(5px)" },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [filter, setFilter] = useState("none");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Filter App</h1>

      <input type="file" onChange={upload} />

      {image && (
        <div>
          <img src={image} style={{ width: 300, filter }} />

          <div style={{ display: "flex", gap: 10 }}>
            {FILTERS.map(f => (
              <button key={f.name} onClick={() => setFilter(f.value)}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}/* =========================
   SCHEMA (DATABASE)
========================= */

import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  dataUrl: text("data_url").notNull(),
  filter: text("filter").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;


/* =========================
   STORAGE (DATABASE LOGIC)
========================= */

import { db } from "./db";
import { images } from "./schema";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {
  async getImages() {
    return db.select().from(images).orderBy(desc(images.createdAt));
  }

  async getImage(id: number) {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async createImage(image: InsertImage) {
    const [created] = await db.insert(images).values(image).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();


/* =========================
   API ROUTES
========================= */

import express from "express";
import { storage } from "./storage";
import { api } from "./routes";
import { z } from "zod";

export function registerRoutes(app: express.Express) {
  app.use(express.json({ limit: "10mb" }));

  app.get(api.images.list.path, async (_req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  app.get(api.images.get.path, async (req, res) => {
    const image = await storage.getImage(Number(req.params.id));
    if (!image) return res.status(404).json({ message: "Not found" });
    res.json(image);
  });

  app.post(api.images.create.path, async (req, res) => {
    try {
      const input = api.images.create.input.parse(req.body);
      const image = await storage.createImage(input);
      res.status(201).json(image);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
}


/* =========================
   ROUTES CONFIG
========================= */

export const api = {
  images: {
    list: { method: "GET", path: "/api/images" },
    get: { method: "GET", path: "/api/images/:id" },
    create: {
      method: "POST",
      path: "/api/images",
      input: insertImageSchema,
    },
  },
};


/* =========================
   FRONTEND (REACT APP)
========================= */

import { useState, useRef } from "react";

const FILTERS = [
  { name: "Normal", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Invert", value: "invert(100%)" },
  { name: "Blur", value: "blur(5px)" },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [filter, setFilter] = useState("none");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Filter App</h1>

      <input type="file" onChange={upload} />

      {image && (
        <div>
          <img src={image} style={{ width: 300, filter }} />

          <div style={{ display: "flex", gap: 10 }}>
            {FILTERS.map(f => (
              <button key={f.name} onClick={() => setFilter(f.value)}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
