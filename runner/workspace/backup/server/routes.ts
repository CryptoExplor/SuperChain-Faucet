import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFaucetClaimSchema } from "@shared/schema";
import { ethers } from "ethers";
import { Redis } from "@upstash/redis";

// Initialize Redis client for rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiting constants
const RATE_LIMIT_HOURS = 168; // 7 days
const RATE_LIMIT_MS = RATE_LIMIT_HOURS * 60 * 60 * 1000;

export async function registerRoutes(app: Express): Promise<Server> {
  // Get Gitcoin Passport score
  app.get("/api/passport/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!ethers.isAddress(address)) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      // Validate required environment variables
      if (!process.env.GITCOIN_API_KEY || !process.env.GITCOIN_SCORER_ID) {
        return res.status(500).json({ 
          message: "Gitcoin API credentials not configured" 
        });
      }

      // Try multiple API endpoints for better compatibility
      let response: Response | null = null;
      let apiError = null;

      // First try the v2 API
      const v2ApiUrl = `https://api.passport.xyz/v2/stamps/${process.env.GITCOIN_SCORER_ID}/score/${address}`;
      console.log(`Trying Gitcoin API v2: ${v2ApiUrl}`);

      try {
        response = await fetch(v2ApiUrl, {
          headers: {
            'X-API-KEY': process.env.GITCOIN_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`v2 API failed with ${response.status}: ${errorText}`);
          apiError = { status: response.status, text: errorText };
          response = null; // Reset to null so we try v1
        }
      } catch (error) {
        console.log(`v2 API request failed:`, error);
        apiError = error;
        response = null;
      }

      // If v2 failed, try the original API
      if (!response) {
        const v1ApiUrl = `https://api.scorer.gitcoin.co/registry/score/${process.env.GITCOIN_SCORER_ID}/${address}`;
        console.log(`Trying Gitcoin API v1: ${v1ApiUrl}`);
        
        try {
          response = await fetch(v1ApiUrl, {
            headers: {
              'X-API-KEY': process.env.GITCOIN_API_KEY,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.log(`v1 API request failed:`, error);
          response = null;
        }
      }

      // Handle case where all APIs failed
      if (!response) {
        throw new Error("Failed to connect to Gitcoin API endpoints");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gitcoin API error ${response.status}:`, errorText);
        
        if (response.status === 404) {
          return res.status(404).json({ message: "No Passport found for this address" });
        }
        if (response.status === 400) {
          return res.status(400).json({ 
            message: "Invalid request to Gitcoin API. Please check your scorer ID and API key configuration." 
          });
        }
        throw new Error(`Gitcoin API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ 
        score: parseFloat(data.score || "0"),
        address: data.address,
        last_score_timestamp: data.last_score_timestamp,
        passing_score: data.passing_score,
        threshold: data.threshold,
        stamp_scores: data.stamp_scores
      });
    } catch (error) {
      console.error("Passport API error:", error);
      res.status(500).json({ message: "Failed to fetch Passport score" });
    }
  });

  // Check rate limit for address
  app.get("/api/rate-limit/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!ethers.isAddress(address)) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      let lastClaimTime = null;

      if (redis) {
        // Check Redis for last claim time
        const lastClaim = await redis.get(`faucet:${address.toLowerCase()}`);
        if (lastClaim) {
          lastClaimTime = parseInt(lastClaim as string);
        }
      } else {
        // Fallback to in-memory storage
        const lastClaim = await storage.getLastClaimByAddress(address);
        if (lastClaim) {
          lastClaimTime = lastClaim.claimedAt.getTime();
        }
      }

      const now = Date.now();
      const isRateLimited = lastClaimTime && (now - lastClaimTime) < RATE_LIMIT_MS;
      const nextClaimTime = lastClaimTime ? lastClaimTime + RATE_LIMIT_MS : null;

      res.json({
        isRateLimited,
        nextClaimTime,
        remainingTime: isRateLimited ? nextClaimTime! - now : 0
      });
    } catch (error) {
      console.error("Rate limit check error:", error);
      res.status(500).json({ message: "Failed to check rate limit" });
    }
  });

  // Claim faucet tokens
  app.post("/api/claim", async (req, res) => {
    try {
      const validatedData = insertFaucetClaimSchema.parse(req.body);
      const { walletAddress, passportScore } = validatedData;

      if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      // Verify Passport score threshold
      const score = parseFloat(passportScore || "0");
      if (score < 10) {
        return res.status(403).json({ message: "Insufficient Gitcoin Passport score. Minimum required: 10" });
      }

      // Check rate limiting
      let lastClaimTime = null;
      if (redis) {
        const lastClaim = await redis.get(`faucet:${walletAddress.toLowerCase()}`);
        if (lastClaim) {
          lastClaimTime = parseInt(lastClaim as string);
        }
      } else {
        const lastClaim = await storage.getLastClaimByAddress(walletAddress);
        if (lastClaim) {
          lastClaimTime = lastClaim.claimedAt.getTime();
        }
      }

      const now = Date.now();
      if (lastClaimTime && (now - lastClaimTime) < RATE_LIMIT_MS) {
        const remainingTime = lastClaimTime + RATE_LIMIT_MS - now;
        return res.status(429).json({ 
          message: "Rate limit exceeded",
          remainingTime,
          nextClaimTime: lastClaimTime + RATE_LIMIT_MS
        });
      }

      // Initialize provider and wallet
      const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
      const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY || "", provider);

      // Send ETH
      const amount = ethers.parseEther("0.001"); // 0.001 ETH
      const tx = await wallet.sendTransaction({
        to: walletAddress,
        value: amount,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error("Transaction failed to confirm");
      }

      // Record the claim
      await storage.createFaucetClaim({
        walletAddress,
        amount: "0.001",
        txHash: receipt.hash,
        passportScore,
      });

      // Update rate limiting
      if (redis) {
        await redis.set(`faucet:${walletAddress.toLowerCase()}`, now.toString(), { ex: Math.ceil(RATE_LIMIT_MS / 1000) });
      }

      res.json({
        success: true,
        txHash: receipt.hash,
        amount: "0.001",
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

    } catch (error: any) {
      console.error("Claim error:", error);
      
      if (error.code === "INSUFFICIENT_FUNDS") {
        return res.status(503).json({ message: "Faucet wallet has insufficient funds" });
      }
      
      if (error.code === "NETWORK_ERROR") {
        return res.status(503).json({ message: "Network error. Please try again later." });
      }

      res.status(500).json({ 
        message: error.message || "Failed to process claim",
        error: process.env.NODE_ENV === "development" ? error.toString() : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
