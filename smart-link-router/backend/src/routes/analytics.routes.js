const express = require('express');
const controller = require('../controllers/analytics.controller');

const router = express.Router();

// Admin-only analytics. TODO(Module 5): mount the admin auth middleware on this
// router once it exists — do not build a separate auth mechanism here.

// Static paths must be registered before the "/:linkId" catch-all below.
router.get('/summary', controller.getGlobalSummary);
router.get('/summary/:linkId', controller.getLinkSummary);
router.get('/:linkId', controller.getLinkEvents);

module.exports = router;
