const express = require('express');
const surveyController = require('../controllers/surveyController');
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/startSurvey', authController.protect, gameController.restartOptions, surveyController.startSurvey);
router.get('/runSurvey/:slug', authController.protect, surveyController.runSurvey);
router.post('/nextQuestion', authController.protect, surveyController.nextQuestion);
router.post('/previousQuestion', authController.protect, surveyController.previousQuestion);
router.get('/calcResults', authController.protect, surveyController.calcResults);

module.exports = router;
