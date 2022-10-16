/* eslint-disable prefer-destructuring */
const Game = require('../models/gameModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const utils = require('../utils/utils');

let origin = process.env.DEFAULT_SEARCH_OPTIONS_ORIGIN;
let sort = process.env.DEFAULT_SEARCH_OPTIONS_SORT;
let type = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_TYPE, 10);
let pageNumber = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_PAGE_NUMBER, 10);
let resPerPage = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_RES_PER_PAGE, 10);
let filter = process.env.DEFAULT_SEARCH_OPTIONS_FILTER;

const populatePagesArray = (array) => {
  const totalPages = [];

  const pages = Math.ceil(array.length / resPerPage);

  // Populate the pages array for pagination
  for (let i = 1; i <= pages; i++) {
    totalPages.push(i);
  }

  return totalPages;
};

// Middleware for restating game search options (used to restart options before getting survey results)
exports.restartOptions = (req, res, next) => {
  if (req.body.origin) {
    origin = req.body.origin;
  } else {
    origin = process.env.DEFAULT_SEARCH_OPTIONS_ORIGIN;
  }
  sort = process.env.DEFAULT_SEARCH_OPTIONS_SORT;
  type = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_TYPE, 10);
  pageNumber = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_PAGE_NUMBER, 10);
  resPerPage = parseInt(process.env.DEFAULT_SEARCH_OPTIONS_RES_PER_PAGE, 10);
  filter = process.env.DEFAULT_SEARCH_OPTIONS_FILTER;

  next();
};

// Middleware for getting search query from user and search options before passing them to the getSearchResults middleware
exports.passQuery = (req, res, next) => {
  origin = req.body.origin;
  sort = req.body.sort;
  type = req.body.type;
  pageNumber = req.body.pageNumber;
  resPerPage = req.body.resPerPage;
  filter = req.body.filter;

  res.status(200).json({
    status: 'success',
    data: {
      query: req.params.query,
    },
  });
};

// Middleware for getting filtered (sort, limit ect) search results using the user query and requested options
exports.getSearchResults = catchAsync(async (req, res, next) => {
  // Get all the games for length and pagination
  const totalGamesArray = await Game.find({ name: { $regex: req.params.query, $options: 'i' }, platforms: { $regex: filter, $options: 'i' } });
  const totalGames = totalGamesArray.length;

  // Get filtered games to be rendered
  const games = await Game.find({ name: { $regex: req.params.query, $options: 'i' }, platforms: { $regex: filter, $options: 'i' } })
    .sort({ [sort]: type })
    .skip(pageNumber > 0 ? (pageNumber - 1) * resPerPage : 0)
    .limit(resPerPage);

  // Limit game description for game card presentation
  games.forEach((el) => {
    el.description = el.limitGameDescription(el.description);
  });

  // Get total number of pages for pagination
  const totalPages = populatePagesArray(totalGamesArray);

  res.status(200).render('search', {
    title: 'search results',
    games,
    totalGames,
    totalPages,
    pageNumber,
  });
});

// Middleware for getting search filters WITHOUT a user query (used in the rec games pages)
exports.getGames = (req, res, next) => {
  origin = req.body.origin;
  sort = req.body.sort;
  type = req.body.type;
  pageNumber = req.body.pageNumber;
  resPerPage = req.body.resPerPage;
  filter = req.body.filter;

  res.status(200).json({
    status: 'success',
  });
};

// Middleware for getting the user recommended games from the user.recommendedGames array in the db
exports.getRecGames = catchAsync(async (req, res, next) => {
  let totalPages = 0;
  let totalGames = 0;

  const user = await User.findById(req.user.id);

  console.log(user.recommendedGames);

  const traitsArray = user.traits;

  const games = await Game.find({ _id: { $in: user.recommendedGames }, platforms: { $regex: filter, $options: 'i' } })
    .sort({ [sort]: type })
    .skip(pageNumber > 0 ? (pageNumber - 1) * resPerPage : 0)
    .limit(resPerPage);

  games.forEach((el) => {
    el.description = el.limitGameDescription(el.description, 897, 900);
  });

  // If there's no filter (platforms) use the user.recommendedGames array otherwise use the array from find()
  if (filter === '') {
    totalPages = populatePagesArray(user.recommendedGames);
    totalGames = user.recommendedGames.length;
  } else {
    totalPages = populatePagesArray(games);
    totalGames = games.length;
  }

  console.log(games.length);

  // Render wanted page according to the origin variable
  if (origin === 'account') {
    res.status(200).render('recommendedGames', {
      title: 'Your recommended games',
      games,
      totalGames,
      totalPages,
      pageNumber,
    });
  } else if (origin === 'survey') {
    res.status(200).render('surveyResults', {
      title: 'survey results',
      games,
      traitsArray,
      totalGames,
      totalPages,
      pageNumber,
    });
  }
});

exports.getGame = catchAsync(async (req, res, next) => {
  const game = await Game.findOne({ slug: req.params.slug });
  if (!game) {
    return next(new AppError('Could not find the requested game!', 404));
  }

  game.released_at = utils.reverseDate(game.released_at);

  res.status(200).render('game', {
    game,
  });
});

exports.getGameStats = (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
};

// Use aggregation to calculate how many games does each trait have and the number of games in each combination of traits
exports.calcGameStats = catchAsync(async (req, res, next) => {
  const traitsArray = await Game.aggregate([
    {
      $unwind: { path: '$big_five_traits' },
    },
    {
      $group: {
        _id: '$big_five_traits',
        numOfGamesWithTrait: {
          $count: {},
        },
      },
    },
  ]);

  const traitsComboArray = await Game.aggregate([
    {
      $group: {
        _id: '$big_five_traits',
        numOfGamesWithTrait: {
          $count: {},
        },
      },
    },
    //{ $sort: { numOfGamesWithTrait: 1 } },
  ]);

  utils.sortTraitIdArray(traitsArray);

  const isObject = false;

  traitsComboArray.sort((a, b) => a._id.length - b._id.length);

  traitsComboArray.forEach((el) => {
    if (el._id.length === 0) {
      el._id = ['No Traits'];
    }
    utils.sortTraitIdArray(el._id, isObject);
    utils.addSpaceToArrayEl(el._id);
  });

  res.status(200).render('gameStats', {
    title: 'game stats',
    traitsArray,
    traitsComboArray,
  });
});
