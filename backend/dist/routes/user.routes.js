"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_util_1 = require("../shared/auth.util");
const role_middleware_1 = require("../middlewares/role.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_util_1.authenticateJWT);
// Routes accessibles uniquement aux admins
router.get('/', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.getUsers);
router.get('/:id', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.getUserById);
router.post('/', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.createUser);
router.put('/:id', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.updateUser);
router.delete('/:id', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.deleteUser);
router.patch('/:id/role', (0, role_middleware_1.authorizeRoles)('Admin'), user_controller_1.changeUserRole);
exports.default = router;
