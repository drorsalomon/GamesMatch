const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

router.use(authController.protect);

router.patch('/update-user-data', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateUserData);
router.patch('/updatePassword', authController.updatePassword);
router.delete('/deleteMe', userController.deleteMe);
router.get('/getUserStats', authController.restrictTo('admin'), userController.getUserStats);
router.get('/user-stats', authController.restrictTo('admin'), userController.calcUserStats);

module.exports = router;
