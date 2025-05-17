const mongoose = require("mongoose");

const cryptoStatSchema = new mongoose.Schema({
  coin: String,
  price_usd: Number,
  market_cap_usd: Number,
  change_24h: Number,
  fetched_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CryptoStat", cryptoStatSchema);
