// jshint esversion:6
const express = require('express');
const  router = express.Router();
const controllers = require('../controllers/writers');
const RequireAuth = require('../middlewares/authrequired');

router.get('/login',controllers.loginuser);
router.get('/register',controllers.registeruser);
router.post('/login',controllers.loginuser);
router.post('/register',controllers.registeruser);
router.get('/activate:id',controllers.activateAccount);
router.get('/logout',RequireAuth,controllers.logout);
router.get('/forgotpassword',controllers.forgotpass);
router.post('/forgotpassword',controllers.forgotpass);
router.get('/resetpassword/:resettoken',controllers.resetPassword);
router.post('/resetpassword/:resettoken',controllers.resetPassword);
router.get('/dashboard',RequireAuth,controllers.dashboard);
module.exports=router;