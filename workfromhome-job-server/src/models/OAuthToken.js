const mongoose = require('mongoose');

const OAuthTokenSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, unique: true, index: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    authorUrn: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OAuthToken', OAuthTokenSchema);
