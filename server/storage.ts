import { users, financeQuotes, type User, type InsertUser, type FinanceQuote, type InsertFinanceQuote } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFinanceQuote(quote: InsertFinanceQuote): Promise<FinanceQuote>;
  getFinanceQuote(id: number): Promise<FinanceQuote | undefined>;
  getAllFinanceQuotes(): Promise<FinanceQuote[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createFinanceQuote(insertQuote: InsertFinanceQuote): Promise<FinanceQuote> {
    const [quote] = await db
      .insert(financeQuotes)
      .values({
        ...insertQuote,
        createdAt: new Date().toISOString()
      })
      .returning();
    return quote;
  }

  async getFinanceQuote(id: number): Promise<FinanceQuote | undefined> {
    const [quote] = await db.select().from(financeQuotes).where(eq(financeQuotes.id, id));
    return quote || undefined;
  }

  async getAllFinanceQuotes(): Promise<FinanceQuote[]> {
    return await db.select().from(financeQuotes);
  }
}

export const storage = new DatabaseStorage();
