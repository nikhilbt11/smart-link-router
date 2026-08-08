const express = require('express');
const controller = require('../controllers/auth.controller');
const adminAuth = require('../middleware/adminAuth');
const { validateLogin } = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validateLogin, controller.login);
router.post('/logout', controller.logout);
router.get('/me', adminAuth, controller.me);

module.exports = router;
