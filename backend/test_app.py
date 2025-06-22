import pytest
import json
from app import app
from etl import ETLPipeline

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def setup_test_db():
    """Set up test database with sample data"""
    etl = ETLPipeline('sqlite:///test_analytics.db')
    etl.create_tables()
    etl.generate_sample_data()
    yield etl

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'timestamp' in data
    assert data['service'] == 'scout-analytics-api'

def test_transactions_endpoint(client):
    """Test transactions endpoint"""
    response = client.get('/api/transactions')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data
    assert 'pagination' in data
    assert data['pagination']['page'] == 1
    assert data['pagination']['per_page'] == 50

def test_transactions_with_pagination(client):
    """Test transactions endpoint with pagination"""
    response = client.get('/api/transactions?page=2&per_page=10')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['pagination']['page'] == 2
    assert data['pagination']['per_page'] == 10

def test_products_endpoint(client):
    """Test products endpoint"""
    response = client.get('/api/products')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data
    assert 'total' in data

def test_products_with_filters(client):
    """Test products endpoint with filters"""
    response = client.get('/api/products?category=Rice&search=Jasmine')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data

def test_regions_endpoint(client):
    """Test regions endpoint"""
    response = client.get('/api/regions')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'data' in data
    assert 'total' in data

def test_analytics_summary_endpoint(client):
    """Test analytics summary endpoint"""
    response = client.get('/api/analytics/summary')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_revenue' in data
    assert 'total_transactions' in data
    assert 'average_basket_size' in data
    assert 'top_products' in data
    assert 'revenue_by_region' in data

def test_analytics_summary_with_filters(client):
    """Test analytics summary with date and region filters"""
    response = client.get('/api/analytics/summary?date_from=2024-01-01&date_to=2024-12-31&region=NCR')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_revenue' in data

def test_brand_performance_endpoint(client):
    """Test brand performance endpoint"""
    response = client.get('/api/analytics/brand-performance?brand=Lucky Me')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['brand'] == 'Lucky Me'
    assert 'metrics' in data
    assert 'revenue' in data['metrics']
    assert 'units_sold' in data['metrics']
    assert 'market_share' in data['metrics']
    assert 'growth_rate' in data['metrics']
    assert 'trends' in data

def test_consumer_insights_endpoint(client):
    """Test consumer insights endpoint"""
    response = client.get('/api/analytics/consumer-insights')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'demographics' in data
    assert 'purchase_patterns' in data
    assert 'preferences' in data

def test_consumer_insights_with_segment(client):
    """Test consumer insights with segment filter"""
    response = client.get('/api/analytics/consumer-insights?segment=Traditional Trade')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'demographics' in data