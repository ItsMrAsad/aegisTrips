import { Request, Response, NextFunction } from "express";

export function authenticateAgent(req: Request, res: Response, next: NextFunction): void {
  const providedKey = req.headers["x-agent-api-key"];
  const expectedKey = process.env.AGENT_API_KEY;

  if (!expectedKey || providedKey !== expectedKey) {
    console.warn("[TEE] Unauthorized agent connection attempt blocked");
    res.status(401).json({ error: "Unauthorized: invalid agent API key" });
    return;
  }

  next();
}

export function budgetGuard(req: Request, res: Response, next: NextFunction): void {
  const BUDGET_LIMIT = 500;
  const cost = Number(req.body?.cost);

  if (isNaN(cost) || cost <= 0) {
    res.status(400).json({ error: "Invalid cost value", received: req.body?.cost });
    return;
  }

  if (cost > BUDGET_LIMIT) {
    console.warn(`[TEE] Budget guard triggered: requested $${cost}, limit $${BUDGET_LIMIT}`);
    res.status(400).json({
      error: `Budget exceeded: $${BUDGET_LIMIT} corporate limit`,
      requested: cost,
      limit: BUDGET_LIMIT,
    });
    return;
  }

  next();
}
