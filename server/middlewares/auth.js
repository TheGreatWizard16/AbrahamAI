import { clerkClient, getAuth } from "@clerk/express";

/**
 * Authentication middleware to attach user info and plan to the request.
 * - Detects if user is premium or free.
 * - Tracks free usage for free users.
 */
export const auth = async (req, res, next) => {
  try {
    // Get authenticated user ID
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Fetch user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Determine plan from private or public metadata, default to "free"
    const planValue =
      user.privateMetadata?.plan?.toString().trim().toLowerCase() ||
      user.privateMetadata?.userPlan?.toString().trim().toLowerCase() ||
      user.publicMetadata?.plan?.toString().trim().toLowerCase() ||
      "free";

    const hasPremiumPlan = planValue === "premium";

    // Attach useful info to the request object
    req.userId = userId;
    req.plan = hasPremiumPlan ? "premium" : "free";
    req.userPrivateMetadata = user.privateMetadata || {};
    req.free_usage = !hasPremiumPlan ? user.privateMetadata?.free_usage || 0 : 0;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
