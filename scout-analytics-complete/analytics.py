from flask import Blueprint, jsonify, request
from src.models.analytics import (
    Transaction, Store, Product, Brand, Customer, 
    TransactionItem, Device, RequestBehavior, Substitution, db
)
from sqlalchemy import func, desc, text
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

analytics_bp = Blueprint('analytics', __name__)

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

@analytics_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get transactions with optional filtering"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        store_id = request.args.get('store_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        # Build query
        query = Transaction.query
        
        if store_id:
            query = query.filter(Transaction.store_id == store_id)
        if from_date:
            query = query.filter(Transaction.timestamp >= from_date)
        if to_date:
            query = query.filter(Transaction.timestamp <= to_date)
            
        # Apply pagination
        transactions = query.offset(offset).limit(limit).all()
        
        # Convert to dict
        result = []
        for t in transactions:
            result.append({
                'transaction_id': t.transaction_id,
                'timestamp': t.timestamp,
                'store_id': t.store_id,
                'store_location': t.store_location,
                'device_id': t.device_id,
                'total_amount': t.total_amount,
                'payment_method': t.payment_method,
                'customer_id': t.customer_id
            })
            
        return jsonify({
            'data': result,
            'total': len(result),
            'offset': offset,
            'limit': limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/volume', methods=['GET'])
def get_volume():
    """Get transaction volume data for charts"""
    try:
        # Simulate hourly volume data
        hourly_data = []
        for hour in range(24):
            volume = random.randint(50, 200)
            hourly_data.append({
                'hour': f"{hour:02d}:00",
                'volume': volume
            })
        
        # Simulate daily volume for the last 30 days
        daily_data = []
        for i in range(30):
            date = datetime.now() - timedelta(days=i)
            volume = random.randint(800, 1500)
            daily_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'volume': volume
            })
        
        return jsonify({
            'hourly': hourly_data,
            'daily': list(reversed(daily_data))
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/category-mix', methods=['GET'])
def get_category_mix():
    """Get product category distribution"""
    try:
        # Get category distribution from products
        categories = db.session.query(
            Product.category,
            func.count(Product.product_id).label('count'),
            func.avg(Product.price).label('avg_price')
        ).group_by(Product.category).all()
        
        result = []
        for cat in categories:
            result.append({
                'category': cat.category,
                'count': cat.count,
                'avg_price': round(cat.avg_price, 2) if cat.avg_price else 0,
                'revenue': round(cat.count * (cat.avg_price or 0), 2)
            })
        
        return jsonify({'data': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/demographics', methods=['GET'])
def get_demographics():
    """Get customer demographics data"""
    try:
        # Age group distribution
        age_groups = db.session.query(
            func.case(
                (Customer.age < 25, '18-24'),
                (Customer.age < 35, '25-34'),
                (Customer.age < 45, '35-44'),
                (Customer.age < 55, '45-54'),
                else_='55+'
            ).label('age_group'),
            func.count(Customer.customer_id).label('count')
        ).group_by('age_group').all()
        
        # Gender distribution
        gender_dist = db.session.query(
            Customer.gender,
            func.count(Customer.customer_id).label('count')
        ).group_by(Customer.gender).all()
        
        # Regional distribution
        regional_dist = db.session.query(
            Customer.region,
            func.count(Customer.customer_id).label('count')
        ).group_by(Customer.region).all()
        
        return jsonify({
            'age_groups': [{'age_group': ag.age_group, 'count': ag.count} for ag in age_groups],
            'gender': [{'gender': g.gender, 'count': g.count} for g in gender_dist],
            'regions': [{'region': r.region, 'count': r.count} for r in regional_dist]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/stores', methods=['GET'])
def get_stores():
    """Get all stores"""
    try:
        stores = Store.query.all()
        result = []
        for s in stores:
            result.append({
                'store_id': s.store_id,
                'name': s.name,
                'location': s.location,
                'barangay': s.barangay,
                'city': s.city,
                'region': s.region,
                'latitude': s.latitude,
                'longitude': s.longitude
            })
        
        return jsonify({'data': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/products', methods=['GET'])
def get_products():
    """Get products with optional category filter"""
    try:
        category = request.args.get('category')
        limit = request.args.get('limit', 50, type=int)
        
        query = Product.query
        if category:
            query = query.filter(Product.category == category)
            
        products = query.limit(limit).all()
        
        result = []
        for p in products:
            result.append({
                'product_id': p.product_id,
                'name': p.name,
                'category': p.category,
                'brand_id': p.brand_id,
                'price': p.price,
                'cost': p.cost
            })
        
        return jsonify({'data': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/ask', methods=['POST'])
def ask_scoutbot():
    """ScoutBot AI assistant - natural language to SQL and insights"""
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        
        # System prompt for ScoutBot
        system_prompt = """You are ScoutBot, a retail BI assistant for Scout Analytics. You help analyze Philippine retail transaction data.

Database Schema:
- transactions: transaction_id, timestamp, store_id, store_location, device_id, total_amount, payment_method, customer_id
- stores: store_id, name, location, barangay, city, region, latitude, longitude
- products: product_id, name, category, brand_id, price, cost
- brands: brand_id, name, category
- customers: customer_id, age, gender, location, barangay, city, region
- transaction_items: transaction_id, product_id, quantity, unit_price, total_price

When users ask questions, provide:
1. Interpreted intent
2. Suggested SQL query (if applicable)
3. Chart recommendation (bar, line, pie, table)
4. Key insights and recommendations

Focus on Philippine retail context: regions like NCR, Cebu, Davao; categories like Beverages, Snacks, Personal Care, Household; payment methods like Cash, GCash, Credit Card."""

        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=os.getenv("AZURE_DEPLOYMENT_NAME"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        return jsonify({
            'query': user_query,
            'response': ai_response,
            'model': os.getenv("AZURE_DEPLOYMENT_NAME"),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/sql', methods=['POST'])
def execute_sql():
    """Execute SQL query against the database"""
    try:
        data = request.get_json()
        sql_query = data.get('sql', '')
        
        # Basic SQL injection protection - only allow SELECT statements
        if not sql_query.strip().upper().startswith('SELECT'):
            return jsonify({'error': 'Only SELECT queries are allowed'}), 400
        
        # Execute the query
        result = db.session.execute(text(sql_query))
        rows = result.fetchall()
        columns = result.keys()
        
        # Convert to list of dictionaries
        data_rows = []
        for row in rows:
            data_rows.append(dict(zip(columns, row)))
        
        return jsonify({
            'sql': sql_query,
            'columns': list(columns),
            'data': data_rows,
            'row_count': len(data_rows)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/retailbot', methods=['POST'])
def retailbot():
    """RetailBot AI assistant endpoint (legacy compatibility)"""
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        query = data.get('query', '')
        
        # Simulate AI response based on query and filters
        actions = [
            {
                'id': 1,
                'title': 'Optimize High-Value Product Placement',
                'description': 'Move premium beverages to eye-level shelves in Metro Manila stores to increase visibility and sales.',
                'category': 'operations',
                'confidence': 87,
                'impact': 'high',
                'filters': {'category': 'Beverages', 'region': 'Metro Manila'},
                'action_type': 'placement_optimization'
            },
            {
                'id': 2,
                'title': 'Launch Weekend Promotion Campaign',
                'description': 'Create targeted promotions for snacks and beverages during weekend peak hours (2-6 PM).',
                'category': 'promotion',
                'confidence': 92,
                'impact': 'medium',
                'filters': {'category': ['Snacks', 'Beverages'], 'time_range': 'weekend'},
                'action_type': 'promotion_campaign'
            },
            {
                'id': 3,
                'title': 'Inventory Rebalancing Alert',
                'description': 'Redistribute slow-moving personal care items from Cebu to NCR stores with higher demand.',
                'category': 'inventory',
                'confidence': 79,
                'impact': 'medium',
                'filters': {'category': 'Personal Care', 'regions': ['Cebu', 'NCR']},
                'action_type': 'inventory_transfer'
            },
            {
                'id': 4,
                'title': 'Customer Segmentation Opportunity',
                'description': 'Target 25-34 age group with premium household products based on purchasing patterns.',
                'category': 'marketing',
                'confidence': 84,
                'impact': 'high',
                'filters': {'age_group': '25-34', 'category': 'Household'},
                'action_type': 'customer_targeting'
            }
        ]
        
        diagnostics = {
            'data_quality': 'good',
            'response_time_ms': random.randint(800, 1200),
            'model_used': 'gpt-4',
            'filters_applied': len(filters),
            'confidence_avg': sum(a['confidence'] for a in actions) / len(actions)
        }
        
        return jsonify({
            'actions': actions,
            'diagnostics': diagnostics,
            'query': query,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

