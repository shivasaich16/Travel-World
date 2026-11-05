import { clerkClient, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";

export async function isTravWorldAuthor(req: Request): Promise<boolean> {
  const ownerEmail = process.env.TRAV_WORLD_OWNER_EMAIL?.trim().toLowerCase();
  const { userId } = getAuth(req);

  // Fail closed until the owner account is explicitly configured.
  if (!ownerEmail || !userId) return false;

  try {
    const user = await clerkClient.users.getUser(userId);
    return user.emailAddresses.some(
      (address) =>
        address.emailAddress.toLowerCase() === ownerEmail &&
        address.verification?.status === "verified",
    );
  } catch {
    req.log.warn("Could not verify Trav-World author identity");
    return false;
  }
}

export const requireTravWorldAuthor: RequestHandler = async (req, res, next) => {
  if (await isTravWorldAuthor(req)) {
    next();
    return;
  }

  res.status(403).json({ error: "Only the Trav-World author can access booking records." });
};

