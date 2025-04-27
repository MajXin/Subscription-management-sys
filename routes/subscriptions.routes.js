import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { createSubscription, getSubscriptions, getAllSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription, cancelSubscription, getUpcomingRenewals } from "../controllers/subscription.controller.js";

const subscriptionsRouter = Router();

subscriptionsRouter.get("/", getAllSubscriptions);

subscriptionsRouter.post("/", authorize, createSubscription);

subscriptionsRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

subscriptionsRouter.get("/user/:id", authorize, getSubscriptions);

subscriptionsRouter.get("/:id", authorize, getSubscriptionById);

subscriptionsRouter.put("/:id", authorize, updateSubscription);

subscriptionsRouter.delete("/:id", authorize, deleteSubscription);

subscriptionsRouter.get("/:id/cancel", authorize, cancelSubscription);

export default subscriptionsRouter;