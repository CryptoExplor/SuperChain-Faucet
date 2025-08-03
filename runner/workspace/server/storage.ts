import { type User, type InsertUser, type FaucetClaim, type InsertFaucetClaim } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getFaucetClaimsByAddress(walletAddress: string): Promise<FaucetClaim[]>;
  createFaucetClaim(claim: InsertFaucetClaim): Promise<FaucetClaim>;
  getLastClaimByAddress(walletAddress: string): Promise<FaucetClaim | undefined>;
  getLastClaimByAddressAndNetwork(address: string, networkId: string): Promise<FaucetClaim | undefined>;
  getClaimsByAddress(address: string): Promise<FaucetClaim[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private faucetClaims: Map<string, FaucetClaim>;

  constructor() {
    this.users = new Map();
    this.faucetClaims = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFaucetClaimsByAddress(walletAddress: string): Promise<FaucetClaim[]> {
    return Array.from(this.faucetClaims.values()).filter(
      (claim) => claim.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createFaucetClaim(insertClaim: InsertFaucetClaim): Promise<FaucetClaim> {
    const id = randomUUID();
    const claim: FaucetClaim = {
      ...insertClaim,
      id,
      claimedAt: new Date(),
      passportScore: insertClaim.passportScore || null,
      isSuccessful: true,
    };
    this.faucetClaims.set(id, claim);
    return claim;
  }

  async getLastClaimByAddress(walletAddress: string): Promise<FaucetClaim | undefined> {
    const claims = await this.getFaucetClaimsByAddress(walletAddress);
    return claims.sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime())[0];
  }

  async getLastClaimByAddressAndNetwork(address: string, networkId: string): Promise<FaucetClaim | undefined> {
    return Array.from(this.faucetClaims.values())
      .filter(claim => 
        claim.walletAddress.toLowerCase() === address.toLowerCase() && 
        claim.networkId === networkId
      )
      .sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime())[0];
  }

  async getClaimsByAddress(address: string): Promise<FaucetClaim[]> {
    return Array.from(this.faucetClaims.values())
      .filter(claim => claim.walletAddress.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime());
  }
}

export const storage = new MemStorage();
