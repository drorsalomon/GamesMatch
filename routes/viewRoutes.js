const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/signup', authController.isLoggedIn, viewController.getSignup);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/forgotPassword', authController.isLoggedIn, viewController.getForgotPassword);
router.get('/resetPassword/:token', authController.isLoggedIn, viewController.getResetPassword);

router.get('/search', authController.isLoggedIn, viewController.getSearch);

router.get('/account', authController.protect, viewController.getAccount);
router.get('/change-password', authController.protect, viewController.getChangePassword);
router.get('/delete-account', authController.protect, viewController.getDeleteAccount);

router.get('/survey', authController.protect, viewController.getSurvey);

module.exports = router;
