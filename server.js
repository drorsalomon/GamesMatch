// server.js is the application entry point

// Connect to the DB
const mongoose = require('mongoose');

// Environment variables file connection package
const dotenv = require('dotenv');

/* Global handling of uncaught exceptions like undefined variables for example. The handling is 
   similar to the unhandled rejection. */
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

// DB variable with connection string and password
const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

/* Connect to the the database with mongoose. We pass out connection string and an object with
   some settings to avoid deprecation warnings. Then we connect with a promise through the 'then()' function. */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

const app = require('./app.js');

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

// Global handler for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION OCCURRED! Shutting down the program...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// We receive sigterm signals from heroku every 24h and in the case that we do we want to gracefully shut the server down.
// The signal shuts the app down automatically, and by using server.close we let the requests that are still being processed
// to finish.
process.on('SIGTERM', () => {
  console.log('SIGTERM received shutting down... 😴');
  server.close(() => {
    console.log('PROCESS TERMINATED! ☠️');
  });
});
