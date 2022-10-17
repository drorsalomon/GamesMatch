const multer = require('multer');
const sharp = require('sharp');
const imgSize = require('image-size');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const utils = require('../utils/utils');

// multer memory storage setup (files are saved as a buffer).
const multerStorage = multer.memoryStorage();

// Test if uploaded file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images.', 400, 'account'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware for multer, we specify that we want to upload only a single photo from the provided url above.
exports.uploadUserPhoto = upload.single('photo');

/* This middleware is used to edit the uploaded user photo in case that it's too big ect. So if there is no file (photo)
   in the request, we want to move to the next middleware. If there is a file we want to resize it using the 'sharp' image
   processing library. We get the file from the memory buffer field and apply the 'resize()' method on it, format the img
   to jpeg, decrees the jpeg quality a bit and finally save it to file. */
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  const imgDimensions = imgSize(req.file.buffer);

  if (imgDimensions.width && imgDimensions.height < 500) {
    await sharp(req.file.buffer).toFormat('jpeg').toFile(`public/img/users/${req.file.filename}`);
  } else {
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
  }
  next();
});

// Function for filtering unwanted fields from the req.body in the updateMe middleware
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Loop over the object fields (keys) and add the allowed fields to the newObj
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/* Here we get the user input data from the user account name and email update form. This method of updating requires a 
   special rout just for this. So we first get the user by its id and update the name and email with the body text that
   is sent in the request. Then we configure that we want to use the updated user (new: true) and that we want to run 
   the validators (runValidators: true). Finally we sent a response that refreshes the account page and sets the user 
   data as the 'updatedUser'. */
exports.updateUserData = catchAsync(async (req, res, next) => {
  // Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // If there is a file (photo) property in the request body, the photo is equal to the filename.
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Middleware used by the user to delete himself from the app (document is not deleted only set to inactive
// - active fields in the user model)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
});

exports.getUserStats = (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
};

// Use aggregation to get avg trait scores across users and avg survey answering time
exports.calcUserStats = catchAsync(async (req, res, next) => {
  const avgTraitsScoreArray = await User.aggregate([
    {
      $unwind: { path: '$traits' },
    },
    {
      $group: {
        _id: '$traits.trait',
        avgTraitScore: { $avg: '$traits.score' },
      },
    },
  ]);

  const avgSurveyCompTime = await User.aggregate([
    {
      $match: { role: 'user' },
    },
    {
      $group: {
        _id: '$role',
        avgCompTime: { $avg: '$surveyAnswerTimeMin' },
      },
    },
  ]);

  utils.sortTraitIdArray(avgTraitsScoreArray.toFixed(2));

  avgSurveyCompTime.find((el) => el._id === 'user').avgCompTime = avgSurveyCompTime.find((el) => el._id === 'user').avgCompTime.toFixed(2);

  res.status(200).render('userStats', {
    title: 'user stats',
    avgTraitsScoreArray,
    avgSurveyCompTime,
  });
});
