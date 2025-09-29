const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  rank: { type: Number, required: true }
});

const leaderboardSchema = new mongoose.Schema({
  competitionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  entries: [leaderboardEntrySchema]
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
