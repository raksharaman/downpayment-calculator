import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new finance quote
  app.post("/api/finance-quotes", async (req, res) => {
    try {
      const { insertFinanceQuoteSchema } = await import("@shared/schema");
      const validatedData = insertFinanceQuoteSchema.parse(req.body);
      const quote = await storage.createFinanceQuote(validatedData);
      res.json(quote);
    } catch (error) {
      res.status(400).json({ error: "Invalid finance quote data" });
    }
  });

  // Get all finance quotes
  app.get("/api/finance-quotes", async (req, res) => {
    try {
      const quotes = await storage.getAllFinanceQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch finance quotes" });
    }
  });

  // Get a specific finance quote by ID
  app.get("/api/finance-quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getFinanceQuote(id);
      if (!quote) {
        return res.status(404).json({ error: "Finance quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch finance quote" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
