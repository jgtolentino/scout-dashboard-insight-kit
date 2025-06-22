from flask import Blueprint, request, jsonify
import sqlite3
from contextlib import contextmanager
import os

categories_bp = Blueprint('categories', __name__)

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

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get categories with optional parent filter"""
    parent_id = request.args.get('parent')
    
    with get_db_connection() as conn:
        if parent_id:
            # Get child categories for the specified parent
            query = """
                SELECT id, name, parent_id, level
                FROM categories
                WHERE parent_id = ?
                ORDER BY name
            """
            categories = conn.execute(query, (parent_id,)).fetchall()
        else:
            # Get top-level categories (parent_id is NULL)
            query = """
                SELECT id, name, parent_id, level
                FROM categories
                WHERE parent_id IS NULL
                ORDER BY name
            """
            categories = conn.execute(query).fetchall()
        
        # Convert to list of dicts
        result = []
        for row in categories:
            result.append({
                'id': row['id'],
                'name': row['name'],
                'parent_id': row['parent_id'],
                'level': row['level']
            })
        
        # Add "All Categories" option
        all_option = {
            'id': None,
            'name': 'All Categories' if not parent_id else 'All Subcategories',
            'level': 0
        }
        
        return jsonify([all_option] + result)