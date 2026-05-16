import express from 'express';
import { signup, login, logout, updateProfile, addTrustedContact, getTrustedContacts } from '../controllers/auth.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

router.post("/add-trusted-contact", protectRoute, addTrustedContact);
router.get("/get-trusted-contacts", protectRoute, getTrustedContacts);

export default router;