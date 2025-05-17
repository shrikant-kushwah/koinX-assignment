require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { connect } = require("nats");
const { storeCryptoStats } = require("./services/cryptoService");
const CryptoStat = require("./models/CryptoStat");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

//route to manually trigger fetch & store of crypto stats
app.get("/fetch-stats", async (req, res) => {
  await storeCryptoStats();
  res.send("Crypto stats fetched and stored!");
});

//route to get the latest stored stats for a specific coin
app.get("/stats", async (req, res) => {
  const { coin } = req.query;


 
  const validCoins = ["bitcoin", "ethereum", "matic-network"];
  if (!coin || !validCoins.includes(coin)) {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'coin' parameter." });
  }


  // fetch the latest record for the coin
  try {
    const latestStat = await CryptoStat.findOne({ coin }).sort({
      fetched_at: -1,
    });

    if (!latestStat) {
      return res
        .status(404)
        .json({ error: "No stats found for this coin yet." });
    }

    // return the formatted data
    res.json({
      price: latestStat.price_usd,
      marketCap: latestStat.market_cap_usd,
      "24hChange": latestStat.change_24h,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching stats." });
  }
});


//utility function to calculate standard deviation
const calculateStandardDeviation = (prices) => {
  const n = prices.length;
  if (n === 0) return 0;

  const mean = prices.reduce((a, b) => a + b, 0) / n;
  const variance =
    prices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  return parseFloat(stdDev.toFixed(2)); 
};

//route to get standard deviation of last 100 prices of a coin
app.get("/deviation", async (req, res) => {
  const { coin } = req.query;

  const validCoins = ["bitcoin", "ethereum", "matic-network"];
  if (!coin || !validCoins.includes(coin)) {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'coin' parameter." });
  }

  try {
    const records = await CryptoStat.find({ coin })
      .sort({ fetched_at: -1 })
      .limit(100);

    const prices = records.map((stat) => stat.price_usd);
    const deviation = calculateStandardDeviation(prices);

    res.json({ deviation });
  } catch (err) {
    console.error("Error in /deviation:", err);
    res
      .status(500)
      .json({ error: "Server error while calculating deviation." });
  }
});

// setup NATS subscription
async function setupNatsSubscription() {
  try {
    const nc = await connect({ servers: process.env.NATS_URL });
    console.log("API server connected to NATS at", process.env.NATS_URL);

    // subscribe to crypto.update events
    const sub = nc.subscribe("crypto.update");
    console.log("Subscribed to crypto.update events");

    // process incoming messages
    (async () => {
      for await (const msg of sub) {
        const data = JSON.parse(msg.data.toString());
        console.log(`[${new Date().toISOString()}] Received:`, data);

        if (data.trigger === "update") {
          console.log("Triggering storeCryptoStats() function...");
          await storeCryptoStats();
        }
      }
    })().catch((err) => console.error("Error processing NATS message:", err));
  } catch (err) {
    console.error("Failed to connect to NATS:", err.message);
  }
}

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  setupNatsSubscription();
});
