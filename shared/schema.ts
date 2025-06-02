import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const financeQuotes = pgTable("finance_quotes", {
  id: serial("id").primaryKey(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).notNull(),
  creditScore: text("credit_score").notNull(),
  financedAmount: decimal("financed_amount", { precision: 10, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  maxApproval: decimal("max_approval", { precision: 10, scale: 2 }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFinanceQuoteSchema = createInsertSchema(financeQuotes).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFinanceQuote = z.infer<typeof insertFinanceQuoteSchema>;
export type FinanceQuote = typeof financeQuotes.$inferSelect;
