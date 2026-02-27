const express = require('express');
const { registerUser, loginUser, registerMember } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser); // for admin/staff
router.post('/register/member', registerMember); // for members
router.post('/login', loginUser);

module.exports = router;