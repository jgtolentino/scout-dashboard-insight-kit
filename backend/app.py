from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import sqlite3
from contextlib import contextmanager

# Import route blueprints
from routes.categories import categories_bp

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_PATH = os.getenv('DATABASE_URL', 'sqlite:///analytics.db').replace('sqlite:///', '')

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    try:
        yield conn
    finally:
        conn.close()

# Register blueprints
app.register_blueprint(categories_bp, url_prefix='/api')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'scout-analytics-api'
    })

# Transactions endpoint
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    parent_category = request.args.get('parent_category')
    sub_category = request.args.get('sub_category')
    
    offset = (page - 1) * per_page
    
    with get_db_connection() as conn:
        # Build query with optional filters
        where_conditions = []
        params = []
        
        if date_from:
            where_conditions.append("t.date >= ?")
            params.append(date_from)
        
        if date_to:
            where_conditions.append("t.date <= ?")
            params.append(date_to)
        
        if parent_category:
            where_conditions.append("p.parent_category_id = ?")
            params.append(parent_category)
        
        if sub_category:
            where_conditions.append("p.category_id = ?")
            params.append(sub_category)
        
        where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total 
            FROM transactions t 
            {where_clause}
        """
        total = conn.execute(count_query, params).fetchone()['total']
        
        # Get transactions with joins
        query = f"""
            SELECT 
                t.transaction_id,
                t.date,
                t.total_amount,
                s.name as store_name,
                s.city,
                s.region,
                c.name as customer_name,
                c.segment
            FROM transactions t
            LEFT JOIN stores s ON t.store_id = s.id
            LEFT JOIN customers c ON t.customer_id = c.id
            {where_clause}
            ORDER BY t.date DESC
            LIMIT ? OFFSET ?
        """
        
        params.extend([per_page, offset])
        transactions = conn.execute(query, params).fetchall()
        
        # Convert to list of dicts
        data = []
        for row in transactions:
            data.append({
                'transaction_id': row['transaction_id'],
                'date': row['date'],
                'total_amount': float(row['total_amount']),
                'store_name': row['store_name'],
                'city': row['city'],
                'region': row['region'],
                'customer_name': row['customer_name'],
                'segment': row['segment']
            })
        
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'data': data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': pages
            }
        })

# Products endpoint
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search')
    
    return jsonify({
        'data': [],
        'total': 0
    })

# Regions endpoint
@app.route('/api/regions', methods=['GET'])
def get_regions():
    return jsonify({
        'data': [],
        'total': 0
    })

# Analytics summary endpoint
@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    region = request.args.get('region')
    
    return jsonify({
        'total_revenue': 0,
        'total_transactions': 0,
        'average_basket_size': 0,
        'top_products': [],
        'revenue_by_region': []
    })

# Brand performance endpoint
@app.route('/api/analytics/brand-performance', methods=['GET'])
def get_brand_performance():
    brand = request.args.get('brand')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    return jsonify({
        'brand': brand,
        'metrics': {
            'revenue': 0,
            'units_sold': 0,
            'market_share': 0,
            'growth_rate': 0
        },
        'trends': []
    })

# Consumer insights endpoint
@app.route('/api/analytics/consumer-insights', methods=['GET'])
def get_consumer_insights():
    segment = request.args.get('segment')
    
    return jsonify({
        'demographics': {},
        'purchase_patterns': [],
        'preferences': []
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)