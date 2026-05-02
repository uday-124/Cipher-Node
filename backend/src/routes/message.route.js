import express from "express";
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// the middleware execute in order - so requests get rate-limited first, theen authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rete limiting before hitting the auth middleware.

router.use(arcjetProtection, protectRoute); // Apply authentication middleware to all routes in this router

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage );

export default router;