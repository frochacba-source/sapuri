import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

// Mock admin user - no authentication required
const MOCK_USER: User = {
  id: 1,
  openId: "admin",
  name: "Admin",
  email: "admin@sapuri.local",
  role: "admin",
  loginMethod: "direct",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Always return mock admin user - no authentication
  return {
    req: opts.req,
    res: opts.res,
    user: MOCK_USER,
  };
}
