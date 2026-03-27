const express = require('express');

const { asyncHandler } = require('../../utils/async-handler');
const userController = require('./user.controller');

const router = express.Router();

router.get('/', asyncHandler(userController.listUsers));

module.exports = router;
