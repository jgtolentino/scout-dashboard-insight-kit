# Scout Analytics Backend API

This is the Flask-based backend API for the Scout Analytics Platform, providing data endpoints for the retail analytics dashboard.

## Features

- RESTful API endpoints for transactions, products, regions, and analytics
- ETL pipeline for data ingestion from CSV/JSON files
- SQLite database for development (easily switchable to PostgreSQL/SQL Server for production)
- OpenAPI 3.0 specification
- Docker support for containerized deployment
- Azure Stack deployment ready

## Setup

### Local Development

1. Create and activate a Python virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the ETL pipeline to set up the database:
```bash
python etl.py
```

4. Start the development server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Docker Development

From the project root:

```bash
# Start both frontend and backend
docker-compose up

# Start only the API
docker-compose up api

# Build and run production container
docker-compose --profile production up app
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/transactions` - Get transaction data with pagination
- `GET /api/products` - Get product catalog
- `GET /api/regions` - Get regions hierarchy
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/brand-performance` - Get brand performance metrics
- `GET /api/analytics/consumer-insights` - Get consumer insights

See `openapi.yaml` for complete API documentation.

## Data Ingestion

The ETL pipeline (`etl.py`) supports:
- CSV file ingestion from the `data/` directory
- JSON file ingestion
- Automatic sample data generation if no data files are found

To add your own data:
1. Place CSV files in the `data/` directory
2. Run `python etl.py` to import the data

Expected file formats:
- `regions.csv` - Region hierarchy data
- `products.csv` - Product catalog
- `customers.csv` - Customer information
- `philippines_transactions.csv` - Transaction data

## Testing

Run tests with pytest:
```bash
pytest
pytest --cov=.  # With coverage
```

## Environment Variables

- `FLASK_ENV` - Set to 'development' or 'production'
- `DATABASE_URL` - Database connection string (defaults to SQLite)
- `PORT` - Server port (defaults to 5000)

## Production Deployment

For production deployment:
1. Use a production database (PostgreSQL or SQL Server)
2. Set appropriate environment variables
3. Use Gunicorn as the WSGI server
4. Deploy using the provided Docker images

See the main project README for Azure Stack deployment instructions.