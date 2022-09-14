const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'], // Validator form correct email pattern.
  },
  photo: {
    type: String,
    default: 'default.jpg', // The default photo is in the public/img/users folder
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: `Password and confirm password fields are not the same!`,
    },
  },
  surveyAnswers: [
    {
      question: {
        type: String,
      },
      trait: {
        type: String,
      },
      number: {
        type: Number,
      },
      answer: {
        type: Number,
      },
      reverse_score: {
        type: Boolean,
      },
    },
  ],
  surveyStartTime: {
    type: Date,
  },
  surveyFinishTime: {
    type: Date,
  },
  surveyAnswerTimeMin: {
    type: Number,
  },
  traits: [
    {
      trait: {
        type: String,
      },
      score: {
        type: Number,
      },
    },
  ],
  recommendedGames: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Game',
    },
  ],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Populate the recommendedGames array when requested (in db the array is populated with game id's - referenced documents)
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'recommendedGames',
    select: 'name platforms images slug playtime esrb_rating background_image description released_at website developers publishers',
  });

  next();
});

userSchema.pre('save', async function (next) {
  // If the password wasn't modified go to next middleware
  if (!this.isModified('password')) return next();

  // Encrypt the password with cpu intensity of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field before persisting to the database
  this.passwordConfirm = undefined;

  next();
});

// Middleware for setting the passwordChangedAt field in the case of updating the password
userSchema.pre('save', function (next) {
  // Dont modify passwordChangedAt if password wasn't modified or a new doc is created
  if (!this.isModified('password') || this.isNew) return next();

  // Subtract 1s so the set time will be before the JWT is issued (JWT timestamp)
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Query middleware that activates before any query that starts with 'find',
// Used so when a find query is initiated only 'active' documents will be retrieved
userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

// Instance method for comparing the input password with the saved user password in the database
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method for checking if the user changed his password after the JWT was issued
// Format the passwordChangedAt field to be presented in seconds and compare it to the JWTTimestamp
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const formattedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < formattedTimestamp;
  }
  return false;
};

// Instance method for creating a reset token for the user who forgot or wants to reset their password
userSchema.methods.createPasswordResetToken = function () {
  // Create a token using the built in crypto package
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Encrypt the token and store it in the passwordResetToken field
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // Set the token expiration time (10min in milliseconds)
  this.passwordResetExpires = Date.now() + process.env.PASSWORD_RESET_TOKEN_VALID_TIME * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
