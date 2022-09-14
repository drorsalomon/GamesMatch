/* eslint-disable arrow-body-style */
/* This function is used instead of a try-catch block in async functions. We wrap our async functions
   with this function and then using the '.catch()' method we can implement a try-catch block in a cleaner
   way. If an exception is caught the function will hand it to our global error handler. */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
