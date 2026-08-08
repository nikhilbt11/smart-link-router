const express = require('express');
const controller = require('../controllers/link.controller');
const { validateCreateLink, validateUpdateLink } = require('../validators/link.validator');

const router = express.Router();

router.post('/', validateCreateLink, controller.createLink);
router.get('/', controller.getLinks);
router.get('/:id', controller.getLinkById);
router.put('/:id', validateUpdateLink, controller.updateLink);
router.delete('/:id', controller.deleteLink);

module.exports = router;
