require("dotenv").config();
const { connect } = require("nats");

const INTERVAL_MS = 15 * 60 * 1000; 

async function startWorker() {
  try {
    const nc = await connect({ servers: process.env.NATS_URL });
    console.log("Worker connected to NATS at", process.env.NATS_URL);

    const publishUpdate = () => {
      const message = { trigger: "update" };
      nc.publish("crypto.update", Buffer.from(JSON.stringify(message)));
      console.log(`[${new Date().toISOString()}] Published:`, message);
    };

    // immediately publish on start
    publishUpdate();

    // publish every 15 minutes
    setInterval(publishUpdate, INTERVAL_MS);
  } catch (err) {
    console.error("Failed to connect to NATS:", err.message);
    process.exit(1);
  }
}

startWorker();
