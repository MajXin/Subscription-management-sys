import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { createSubscription, getSubscriptions } from "../controllers/subscription.controller.js";

const subscriptionsRouter = Router();

subscriptionsRouter.get("/", (req, res) => {res.send({title: "GET all subscriptions"})});

subscriptionsRouter.get("/:id", (req, res) => {res.send({title: "GET subscription details"})});

subscriptionsRouter.post("/", authorize, createSubscription);

subscriptionsRouter.put("/:id", (req, res) => {res.send({title: "UPDATE subscription"})});

subscriptionsRouter.delete("/:id", (req, res) => {res.send({title: "DELETE subscription"})});

subscriptionsRouter.get("/user/:id", authorize, getSubscriptions);

subscriptionsRouter.get("/:id/cancel", (req, res) => {res.send({title: "CANCEL subscription"})});

subscriptionsRouter.get("/upcoming-renewals", (req, res) => {res.send({title: "GET upcoming renewals"})});

export default subscriptionsRouter;