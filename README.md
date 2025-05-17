# Crypto Price Tracking System

This project consists of two microservices that work together to track cryptocurrency prices and statistics:

1. **API Server**: Provides REST endpoints for retrieving cryptocurrency statistics and handles data storage
2. **Worker Server**: Periodically triggers the API server to fetch fresh cryptocurrency data

## Architecture

- **Communication**: NATS messaging system for service-to-service communication
- **Database**: MongoDB for storing cryptocurrency statistics
- **API**: CoinGecko API for fetching real-time cryptocurrency data

## Features

- Fetch and store statistics for Bitcoin, Ethereum, and Polygon (MATIC)
- Retrieve latest price, market cap, and 24h change for a specific coin
- Calculate price standard deviation based on historical data
- Automated data collection every 15 minutes

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally on port 27017
- NATS server running locally on port 4222

### Installation

1. Clone the repository
2. Install dependencies for both services:

```bash
# Install API server dependencies
cd api-server
npm install

# Install Worker server dependencies
cd ../worker-server
npm install
```

### Configuration

Both services use `.env` files for configuration. The default configuration assumes:

- MongoDB running at `mongodb://localhost:27017/cryptoStats`
- NATS server running at `nats://localhost:4222`
- API server running on port 3000

You can modify these settings in the respective `.env` files if needed.

## Running the System

1. Start MongoDB and NATS servers
2. Start the API server:

```bash
cd api-server
npm start
```

3. Start the Worker server in a separate terminal:

```bash
cd worker-server
npm start
```

## Testing the System

### API Endpoints

1. **Get Latest Stats for a Coin**:
   ```
   GET http://localhost:3000/stats?coin=bitcoin
   ```
   Also supports `ethereum` and `matic-network`

2. **Get Price Standard Deviation**:
   ```
   GET http://localhost:3000/deviation?coin=bitcoin
   ```
   Also supports `ethereum` and `matic-network`

3. **Manually Trigger Data Fetch**:
   ```
   GET http://localhost:3000/fetch-stats
   ```

## Potential Improvements

1. **Error Handling**: Implement more robust error handling and retries for API calls
2. **Logging**: Add structured logging with levels (info, warn, error)
3. **Testing**: Add unit and integration tests
4. **Rate Limiting**: Implement rate limiting for the CoinGecko API
5. **Authentication**: Add API authentication for production use
6. **Cloud Deployment**: Deploy to a cloud platform with MongoDB Atlas
7. **Monitoring**: Add health checks and monitoring
8. **Docker**: Containerize the application for easier deployment

## Troubleshooting

- If you encounter NATS connection issues, ensure the NATS server is running
- If MongoDB connection fails, check that MongoDB is running and accessible
- For CoinGecko API issues, be aware of rate limits which may require implementing delays between requests