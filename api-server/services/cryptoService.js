const axios = require("axios");
const CryptoStat = require("../models/CryptoStat");


const COINS = ["bitcoin", "ethereum", "matic-network"];


 // Fetch data from CoinGecko for Bitcoin, Matic-Network, and Ethereum
async function storeCryptoStats() {
  try {   
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids: COINS.join(","),
        vs_currencies: "usd",
        include_market_cap: "true",
        include_24hr_change: "true"
      }
    });

    const data = response.data;


    // loop through each coin and save its data to the database
    for (const coin of COINS) {
      const stats = new CryptoStat({
        coin,
        price_usd: data[coin].usd,
        market_cap_usd: data[coin].usd_market_cap,
        change_24h: data[coin].usd_24h_change
      });

      await stats.save();
      console.log(`[Saved] ${coin}: $${data[coin].usd}`);
    }
  } catch (err) {
    console.error("Error fetching or storing crypto stats:", err.message);
  }
}

module.exports = { storeCryptoStats };
