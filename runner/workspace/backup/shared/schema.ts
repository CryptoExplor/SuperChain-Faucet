import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const faucetClaims = pgTable("faucet_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  amount: text("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  passportScore: text("passport_score"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFaucetClaimSchema = createInsertSchema(faucetClaims).pick({
  walletAddress: true,
  amount: true,
  txHash: true,
  passportScore: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type FaucetClaim = typeof faucetClaims.$inferSelect;
export type InsertFaucetClaim = z.infer<typeof insertFaucetClaimSchema>;
