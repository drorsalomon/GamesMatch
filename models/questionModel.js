const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  slug: {
    type: String,
  },
  question_num: {
    // The id is also the question number
    type: Number,
    required: [true, 'A question must have a number!'],
    unique: true,
  },
  questioner: {
    type: String,
    required: [true, 'A question must belong to a questioner!'],
  },
  trait: {
    type: String,
    required: [true, 'A question must specify a trait!'],
  },
  question: {
    type: String,
    required: [true, 'A question must have content!'],
  },
  reverse_score: {
    type: Boolean,
    required: [true, 'For score calculation, please set the reverse score property to true or false.'],
  },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
