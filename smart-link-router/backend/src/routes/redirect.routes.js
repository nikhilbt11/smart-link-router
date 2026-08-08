const express = require('express');
const { redirectByAlias } = require('../controllers/redirect.controller');

const router = express.Router();

router.get('/:alias', redirectByAlias);

module.exports = router;
