const express = require('express');
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/recommended-games', authController.protect, gameController.getRecGames);
router.get('/getGameStats', authController.protect, authController.restrictTo('admin'), gameController.getGameStats);
router.get('/game-stats', authController.protect, authController.restrictTo('admin'), gameController.calcGameStats);
router.get('/search/:query', authController.isLoggedIn, gameController.getSearchResults);
router.get('/:slug', authController.isLoggedIn, gameController.getGame);
router.post('/passQuery/:query', gameController.passQuery);
router.post('/getGames', gameController.getGames);

module.exports = router;
