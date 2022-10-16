const AppError = require('../utils/appError');

/* Function for handling token verification errors from the json web token library. If an error ocurred, we 
   send back a message and specify the 401 status which means unauthorized. */
const handleJWTError = () => new AppError('You must be logged in to view this page!', 401);

/* Function for handling a token expired error from the json web token library. If an error ocurred, we 
      send back a message and specify the 401 status which means unauthorized. */
const handleJWTExpiredError = () => new AppError('Token has expired, please login again!', 401);

// Email already exists in the DB when user tries to register
const handleEmailExistsError = () => new AppError('Email already connected to another user! please choose a different one.', 401);

// Password and confirm password fields are not the same
const passwordsNotTheSame = () => new AppError('Password and confirm password fields are not the same!', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.name === 'ValidationError' && err.message.includes('passwordConfirm')) {
      err.message = err.message.substring(41, 250);
    }

    if (err.name === 'MongoError' && err.message.includes('email_1 dup key:')) {
      err = handleEmailExistsError();
    }
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  console.error('ERROR 💥', err);
  console.log(err.message);
  console.log(err.name);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  // If the error is operational (caused by the app logic)... the 'isOperational' variable is specified in the appError class
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // If the error is a bug in the app we want to log the error for review and send the user a generic message
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  //console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // If we are in development mode get as much info about the error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    // If we are in production mode only partially expose some info to the user about the error
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    // If the jwt token has expired, we assign the error to 'handleJWTExpiredError()'.
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    if (err.name === 'ValidationError' && err.message.includes('passwordConfirm')) err = passwordsNotTheSame();
    if (err.name === 'MongoError' && err.message.includes('email_1 dup key:')) err = handleEmailExistsError();
    sendErrorProd(err, req, res);
  }
};
