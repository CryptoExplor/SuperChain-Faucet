import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const networks = pgTable("networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  chainId: integer("chain_id").notNull().unique(),
  rpcUrl: text("rpc_url").notNull(),
  nativeCurrency: text("native_currency").notNull(),
  explorerUrl: text("explorer_url").notNull(),
  faucetAmount: text("faucet_amount").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faucetClaims = pgTable("faucet_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  networkId: varchar("network_id").notNull(),
  amount: text("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  passportScore: text("passport_score"),
  blockNumber: integer("block_number"),
  gasUsed: text("gas_used"),
  isSuccessful: boolean("is_successful").default(true).notNull(),
});

// Relations
export const networksRelations = relations(networks, ({ many }) => ({
  claims: many(faucetClaims),
}));

export const faucetClaimsRelations = relations(faucetClaims, ({ one }) => ({
  network: one(networks, {
    fields: [faucetClaims.networkId],
    references: [networks.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  createdAt: true,
});

export const insertFaucetClaimSchema = createInsertSchema(faucetClaims).pick({
  walletAddress: true,
  networkId: true,
  amount: true,
  txHash: true,
  passportScore: true,
  blockNumber: true,
  gasUsed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Network = typeof networks.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type FaucetClaim = typeof faucetClaims.$inferSelect;
export type InsertFaucetClaim = z.infer<typeof insertFaucetClaimSchema>;
