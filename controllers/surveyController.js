const Question = require('../models/questionModel');
const User = require('../models/userModel');
const Game = require('../models/gameModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const utils = require('../utils/utils');

const clearSurveyData = (user) => {
  if (user.surveyAnswers.length > 0) {
    user.updateOne({ surveyAnswers: [] }, (error) => {});
    user.updateOne({ traits: [] }, (error) => {});
    user.updateOne({ recommendedGames: [] }, (error) => {});
  }
};

exports.startSurvey = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found! please login again.', 404));
  }

  clearSurveyData(user);

  const firstQuestion = await Question.findOne({ slug: 'question-01' });

  if (!firstQuestion) {
    return next(new AppError("Can't find the requested question, please try again later.", 404));
  }

  user.surveyStartTime = Date.now();

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      slug: firstQuestion.slug,
    },
  });
});

exports.runSurvey = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found! please login again.', 404));
  }

  // If the user already finished the survey and tries to go back to it - redirect to the /survey page
  if (user.recommendedGames.length > 0) {
    res.redirect(301, '/survey');
  } else {
    const question = await Question.findOne({ slug: req.params.slug });

    if (!question) {
      return next(new AppError("Can't find the requested question, please try again later.", 404));
    }

    let userAnswered = 0;

    // Used in case that the user wen't to a previous question.
    // If so get the answer that the user gave and pass it to be marked in the template
    if (question.question_num <= user.surveyAnswers.length) {
      userAnswered = user.surveyAnswers[question.question_num - 1].answer;
    }

    res.status(200).render('question', {
      title: 'Question',
      question,
      userAnswered,
    });
  }
});

exports.nextQuestion = catchAsync(async (req, res, next) => {
  if (!req.body.userInput) {
    return next(new AppError('Please choose an option before continuing to the next question.', 403));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found! please login again.', 404));
  }

  const currentQuestion = await Question.findOne({ question_num: req.body.currentQuestionNum });

  if (!currentQuestion) {
    return next(new AppError("Can't find the requested question, please try again later.", 404));
  }

  let questionAnswered = false;

  // Check if the question number matches a question number that is already in the array
  user.surveyAnswers.forEach((el) => {
    if (el.number === req.body.currentQuestionNum) {
      questionAnswered = true;
    }
  });

  // If question was already answered update the answer, else add a new element to the surveyAnswers question array
  if (questionAnswered) {
    const index = user.surveyAnswers.findIndex((el) => el.number === req.body.currentQuestionNum);
    user.surveyAnswers[index].answer = req.body.userInput;
  } else {
    user.surveyAnswers.push({
      question: currentQuestion.question,
      trait: currentQuestion.trait,
      number: req.body.currentQuestionNum,
      answer: req.body.userInput,
      reverse_score: currentQuestion.reverse_score,
    });
  }

  await user.save({ validateBeforeSave: false });

  let nextQuestion = {};

  // If the current question isn't the last question on the survey pass another question to the template
  if (req.body.currentQuestionNum !== parseInt(process.env.BIG_FIVE_LAST_QUESTION_NUM, 10)) {
    nextQuestion = await Question.findOne({ question_num: req.body.nextQuestionNum });

    if (!nextQuestion) {
      return next(new AppError("Can't find the requested question, please try again later.", 404));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      slug: nextQuestion.slug,
    },
  });
});

exports.previousQuestion = catchAsync(async (req, res, next) => {
  const previousQuestion = await Question.findOne({ question_num: req.body.previousQuestionNum });

  if (!previousQuestion) {
    return next(new AppError("Can't find the requested question, please try again later.", 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      slug: previousQuestion.slug,
    },
  });
});

exports.calcResults = catchAsync(async (req, res, next) => {
  let games = [];
  let gamesFindArray = [];
  const gamesIds = [];

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found! please login again.', 404));
  }

  const resultsMap = new Map();
  resultsMap.set(process.env.BIG_FIVE_TRAIT_EXTROVERSION, parseInt(process.env.TRAIT_EXTROVERSION_BASE_SCORE, 10));
  resultsMap.set(process.env.BIG_FIVE_TRAIT_AGREEABLENESS, parseInt(process.env.TRAIT_AGREEABLENESS_BASE_SCORE, 10));
  resultsMap.set(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS, parseInt(process.env.TRAIT_CONSCIENTIOUSNESS_BASE_SCORE, 10));
  resultsMap.set(process.env.BIG_FIVE_TRAIT_NEUROTICISM, parseInt(process.env.TRAIT_NEUROTICISM_BASE_SCORE, 10));
  resultsMap.set(process.env.BIG_FIVE_TRAIT_OPENNESS, parseInt(process.env.TRAIT_OPENNESS_BASE_SCORE, 10));

  // Calculate trait score from user survey answers array
  user.surveyAnswers.forEach((el) => {
    // eslint-disable-next-line default-case
    switch (el.trait) {
      case process.env.BIG_FIVE_TRAIT_EXTROVERSION:
        if (el.reverse_score) {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_EXTROVERSION, resultsMap.get(process.env.BIG_FIVE_TRAIT_EXTROVERSION) - el.answer);
        } else {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_EXTROVERSION, resultsMap.get(process.env.BIG_FIVE_TRAIT_EXTROVERSION) + el.answer);
        }
        break;
      case process.env.BIG_FIVE_TRAIT_AGREEABLENESS:
        if (el.reverse_score) {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_AGREEABLENESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_AGREEABLENESS) - el.answer);
        } else {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_AGREEABLENESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_AGREEABLENESS) + el.answer);
        }
        break;
      case process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS:
        if (el.reverse_score) {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS) - el.answer);
        } else {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS) + el.answer);
        }
        break;
      case process.env.BIG_FIVE_TRAIT_NEUROTICISM:
        if (el.reverse_score) {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_NEUROTICISM, resultsMap.get(process.env.BIG_FIVE_TRAIT_NEUROTICISM) - el.answer);
        } else {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_NEUROTICISM, resultsMap.get(process.env.BIG_FIVE_TRAIT_NEUROTICISM) + el.answer);
        }
        break;
      case process.env.BIG_FIVE_TRAIT_OPENNESS:
        if (el.reverse_score) {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_OPENNESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_OPENNESS) - el.answer);
        } else {
          resultsMap.set(process.env.BIG_FIVE_TRAIT_OPENNESS, resultsMap.get(process.env.BIG_FIVE_TRAIT_OPENNESS) + el.answer);
        }
        break;
    }
  });

  // Populate user traits array
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of resultsMap) {
    user.traits.push({ trait: key, score: value });
  }

  // Create recommended games array according to user trait scores
  if (resultsMap.get(process.env.BIG_FIVE_TRAIT_EXTROVERSION) >= parseInt(process.env.TRAIT_EXTROVERSION_MIN_SCORE, 10)) {
    games = await Game.find({
      big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_EXTROVERSION, $options: 'i' },
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
  }
  if (resultsMap.get(process.env.BIG_FIVE_TRAIT_AGREEABLENESS) >= parseInt(process.env.TRAIT_AGREEABLENESS_MIN_SCORE, 10)) {
    gamesFindArray = await Game.find({
      big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_AGREEABLENESS, $options: 'i' },
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
    games = games.concat(utils.filterArray(games, gamesFindArray));
  }
  if (resultsMap.get(process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS) >= parseInt(process.env.TRAIT_CONSCIENTIOUSNESS_MIN_SCORE, 10)) {
    gamesFindArray = await Game.find({
      big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS, $options: 'i' },
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
    games = games.concat(utils.filterArray(games, gamesFindArray));
  }
  if (resultsMap.get(process.env.BIG_FIVE_TRAIT_NEUROTICISM) >= parseInt(process.env.TRAIT_NEUROTICISM_MIN_SCORE, 10)) {
    gamesFindArray = await Game.find({
      big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_NEUROTICISM, $options: 'i' },
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
    games = games.concat(utils.filterArray(games, gamesFindArray));
  }
  if (resultsMap.get(process.env.BIG_FIVE_TRAIT_OPENNESS) >= parseInt(process.env.TRAIT_OPENNESS_MIN_SCORE, 10)) {
    gamesFindArray = await Game.find({
      big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_OPENNESS, $options: 'i' },
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
    games = games.concat(utils.filterArray(games, gamesFindArray));
  }
  // if there are no games found by traits, populate the array with games that posses all 5 traits
  if (games.length === 0) {
    games = await Game.find({
      $and: [
        { big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_EXTROVERSION, $options: 'i' } },
        { big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_AGREEABLENESS, $options: 'i' } },
        { big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_CONSCIENTIOUSNESS, $options: 'i' } },
        { big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_NEUROTICISM, $options: 'i' } },
        { big_five_traits: { $regex: process.env.BIG_FIVE_TRAIT_OPENNESS, $options: 'i' } },
      ],
      metacritic: { $gte: process.env.METACRITIC_MIN_VALUE },
    });
  }

  // Create games ID's array for user recommended games array (referencing the corresponding games)
  games.forEach((el) => {
    gamesIds.push(el._id);
  });

  // Populate user recommended games array
  user.recommendedGames = gamesIds;

  user.surveyFinishTime = Date.now();

  // Format survey answering time as min:sec and save in DB
  user.surveyAnswerTimeMin = utils.millisToMinsAndSecs(user.surveyFinishTime - user.surveyStartTime);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});
