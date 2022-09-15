const { promisify } = require('util'); // Built in node object for the promisify method.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const tls = require('node:tls');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Function for creating the JWT using the document mongoDB id, jwt secret and passing the expiresIn option
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Function for creating the JWT and sending it to the user in the response
const createSendToken = (user, statusCode, req, res) => {
  // Create the token for the user with the sent user._id
  const token = signToken(user._id);

  // Create and send a cookie with the token and the specified options (expires, httpOnly, secure)
  res.cookie('jwt', token, {
    // expiration date of 90 days converted to milliseconds
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // Prevent from the browser to access the cookie, the browser will only receive, store and send the cookie with requests
    httpOnly: true,
    // if we're on a secure connection and the header is set to https (this is an heroku requirement), secure the cookie
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  user.password = undefined; // Remove the password from the response output.

  // Send token in the response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/* This function is used for user login. We create a new user and assign a UserSchema to it, 
   with the request body as the information that feeds the schema. 
   For sending the user a welcome email we create a new Email object and specify the user and the user
   photo url which we get from the request. 'req.protocol' is the http or https, and 'req.get('host')' is
   the host url (127.0.0.1:8000 and so on). 
   After that we use the json web token library for signing up, logging in and authentication.
   The id that we pass in the 'signToken()' function is the id from the newly created user. */
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/account`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // If email or password aren't provided - send error
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password!', 400));
  }

  // Check if the user exists in the database by email and password.
  const user = await User.findOne({ email }).select('+password');

  // If the user doesn't exist or the passwords don't match - send error
  if (!user || !(await user.correctPassword(password, user.password))) {
    //return next(alertController.showAlert(req, res, 'ERROR!!!!!!'));
    return next(new AppError('Incorrect email or password!', 401));
  }
  // Send token
  createSendToken(user, 200, req, res);
});

/* This logout function will simply create a cookie with the same name as the login cookie by without the 
   token. It will overwrite the previous cookie and thus logout the user. */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
  //res.redirect(301, '/');
};

// Middleware for protecting routes - grant access to route via JWT
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // If the authorization header exist and startsWith Bearer - get the JWT from the string
  // Else if the token is saved as a cookie - get it from the cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // If there's no token (user is not logged in) - send error
  if (!token) {
    return next(new Error('You are not logged in! please log in to get access.', 401));
  }

  // Verify the token using the secret saved in the database. verify() is an async function so we can promisify it.
  // We pass in the token and the secret for comparison
  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists. If there's no user with this id in the db - send error
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(new AppError('The user that belongs to this token no longer exists!', 401));
  }

  // 4) Check if user changed password after the token was issued.
  // iat = issued at (JWT issued timestamp)
  if (currentUser.changedPasswordAfter(decodedToken.iat) === true) {
    return next(new AppError('User recently changed his password! please login again.', 401));
  }

  // Store the currentUser so the next middlewares in the stack have access to its data (like role).
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Middleware for restricting certain routes from certain users by their assigned roles
// The req.user.role field comes from the 'protect' middleware which runs before this one
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permissions to perform this action!', 403));
    }
    next();
  };
};

// Middleware for sending a password reset token to the user email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Can't find a user with this email, please try again", 404));
  }

  // Generate random Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    await new Email(user, resetURL, process.env.PASSWORD_RESET_TOKEN_VALID_TIME).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email! Try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
  // Find the user by his reset token saved in the data base with the condition that the token hasn't expired
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  // If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired! Please start the process again.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update changedPasswordAt property for the user -> done using the pre save middleware in the user model.
  // Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from the database by his id (we have the user from the 'protect' middleware)
  const user = await User.findById(req.user.id).select('+password');

  // Check if the POSTed password (password sent in the request) matches the password in the database
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // If so, update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmPassword;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

/* This middleware is used to determine if the user is logged in or not for rendered pages. It is very similar to the 
   'protect' middleware but it does not issue any errors. if the cookie (token) is verified and the user still exists
   and he also didn't change his password we know that there is a logged in user in our app. At the end of this middleware
   we specified that if there is a logged in user in our app, we want to notify our pug template of that and  we can do 
   using the 'res.locals.user' variable. So all our pug templates will have access to 'res.locals' and whatever we put
   inside it (user). */
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat) === true) {
        return next();
      }

      // THERE IS A LOGGED IN USER - Allow our pug templates access to the user via res.locals.user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
