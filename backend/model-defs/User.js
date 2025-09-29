const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  profileDetails: { type: mongoose.Schema.Types.Mixed },
  competitionHistory: [
    {
      competitionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
      score: { type: Number }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
