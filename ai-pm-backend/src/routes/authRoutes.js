const express = require("express");
const router = express.Router();
const{register,login,forgotPassword,resetPassword} = require("../controllers/authController");
//defining API-ROUTES
router.post('/register',register);
router.post('/login',login);
router.post('/forgotpassword',forgotPassword);
router.post('/resetpassword',resetPassword);
module.exports=router;
