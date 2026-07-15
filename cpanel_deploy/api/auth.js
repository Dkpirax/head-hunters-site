"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (email !== adminEmail) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, adminPasswordHash || '');
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ email: adminEmail, role: 'admin' }, process.env.AUTH_SECRET || 'fallback-secret', { expiresIn: '1d' });
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    return res.json({ success: true });
});
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.json({ success: true });
});
router.get('/session', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.json({ user: null });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.AUTH_SECRET || 'fallback-secret');
        return res.json({ user: decoded });
    }
    catch (err) {
        return res.json({ user: null });
    }
});
exports.default = router;
