const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A game must have a name!'],
    unique: true,
    trim: true,
    maxlength: [40, 'A game name must have less or equal then 40 characters'],
  },
  slug: String,
  platforms: [String],
  metacritic: Number,
  playtime: Number,
  esrb_rating: String,
  tags: [String],
  background_image: String,
  images: [String],
  big_five_traits: [String],
  description: String,
  released_at: String,
  website: String,
  developers: [
    {
      name: String,
      slug: String,
      image_background: String,
    },
  ],
  publishers: [
    {
      name: String,
      slug: String,
      image_background: String,
    },
  ],
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

gameSchema.index({ big_five_traits: 1, metacritic: { $gte: process.env.METACRITIC_MIN_VALUE } });
gameSchema.index({ name: -1 });
gameSchema.index({ name: 1, metacritic: 1 });
gameSchema.index({ name: 1, metacritic: -1 });
gameSchema.index({ name: 1, released_at: 1 });
gameSchema.index({ name: 1, released_at: -1 });

gameSchema.methods.limitGameDescription = function (desc, limit = 947, fromChar = 950, toChar = 50000) {
  if (desc.length > limit) {
    desc = desc.replace(desc.substring(fromChar, toChar).trim(), '...');
    return desc;
  }
  return desc;
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
