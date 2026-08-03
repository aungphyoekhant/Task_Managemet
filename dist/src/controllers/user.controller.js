import { userServices } from "../services/user.service.js";
import { authService } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { loginValidator, registerValidator } from "../validators/userauth.js";
export const userController = {
    register: async (req, res) => {
        try {
            const result = registerValidator.validate(req.body);
            if (result.error) {
                return res.status(400).json({ con: false, msg: result.error.details[0].message });
            }
            const { email, password, name, token } = req.body;
            let userData;
            if (token) {
                userData = await userServices.inviteRegister({ email, password, name }, token);
                return res.status(201).json({
                    con: true,
                    msg: "Joined workspace successfully",
                    data: userData
                });
            }
            else {
                userData = await userServices.register({ email, password, name });
                return res.status(201).json({
                    con: true,
                    msg: "Account created successfully",
                    data: userData
                });
            }
        }
        catch (error) {
            console.error("Register Error:", error);
            return res.status(500).json({
                con: false,
                msg: error.message || "Registration failed"
            });
        }
    },
    login: async (req, res) => {
        try {
            const result = loginValidator.validate(req.body);
            if (result.error)
                return res.status(400).json({ con: false, msg: result.error.details[0].message });
            const { email, password, token } = result.value;
            const { user, accessToken, refreshToken } = await userServices.login(email, password, token);
            return res.status(200).json({
                con: true,
                msg: "Login Successful",
                data: {
                    user,
                    accessToken,
                    refreshToken,
                },
            });
        }
        catch (error) {
            return res.status(401).json({ con: false, msg: error.message });
        }
    },
    // LOGOUT
    logout: async (req, res) => {
        try {
            const userId = Number(res.locals.user.id);
            await userServices.logout(userId);
            return res.status(200).json({ con: true, msg: "Logged out successfully" });
        }
        catch (error) {
            return res.status(500).json({ con: false, msg: "Logout failed" });
        }
    },
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                return res.status(401).json({ con: false, msg: "Refresh token required" });
            const payload = authService.verifyRefreshToken(refreshToken);
            const newAccessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            return res.status(200).json({ con: true, accessToken: newAccessToken });
        }
        catch (error) {
            return res.status(403).json({ con: false, msg: "Invalid or expired token" });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ success: false, message: "Email is required." });
            const checkEmail = await authService.findByEmail(email);
            if (!checkEmail) {
                return res.status(400).json({ success: false, message: "Email address not found. Please check and try again." });
            }
            const result = await userServices.forgetPassword(email);
            return res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error });
        }
    },
    verifyCode: async (req, res) => {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({ success: false, message: "Email and code are required." });
            }
            const result = await userServices.verifyResetCode(email, code);
            return res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { email, code, newPassword, confirmPassword } = req.body;
            if (!email || !code || !newPassword || !confirmPassword) {
                return res.status(400).json({ success: false, message: "All fields are required." });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: "Passwords do not match." });
            }
            const result = await userServices.resetPasswordWithCode(email, code, newPassword);
            return res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error });
        }
    },
    deleteAccount: async (req, res) => {
        try {
            const userId = Number(res.locals.user.id);
            if (!userId)
                return res.status(400).json({ success: false, message: "User ID is required." });
            const result = await userServices.deleteAccount(userId);
            return res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error });
        }
    },
    changePassword: async (req, res) => {
        try {
            const userId = Number(res.locals.user?.id);
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            if (!userId || isNaN(userId)) {
                return res.status(401).json({
                    con: false,
                    msg: "Unauthorized: Invalid user authentication",
                });
            }
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                return res.status(400).json({
                    con: false,
                    msg: "All password fields are required",
                });
            }
            await userServices.changePassword({
                userId,
                currentPassword,
                newPassword,
                confirmNewPassword,
            });
            return res.status(200).json({
                con: true,
                msg: "Password updated successfully",
            });
        }
        catch (error) {
            console.error("[Change Password Error]:", error);
            return res.status(400).json({
                con: false,
                msg: error?.message || "Internal Server Error",
            });
        }
    }
};
