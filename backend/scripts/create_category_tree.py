#!/usr/bin/env python3
"""
Create hierarchical category structure in the database
"""

import sqlite3
import os
import sys

# Database configuration
DATABASE_PATH = os.getenv('DATABASE_URL', 'sqlite:///analytics.db').replace('sqlite:///', '')

# Category tree data
CATEGORY_TREE = [
    {
        "name": "Beverages",
        "children": [
            {
                "name": "Coffee",
                "children": [
                    {"name": "Instant Coffee"},
                    {"name": "Ground Coffee"},
                    {"name": "Coffee Mixes"}
                ]
            },
            {
                "name": "Tea",
                "children": [
                    {"name": "Black Tea"},
                    {"name": "Green Tea"},
                    {"name": "Herbal Tea"}
                ]
            },
            {
                "name": "Soda",
                "children": [
                    {"name": "Cola"},
                    {"name": "Lemon-Lime"},
                    {"name": "Root Beer"}
                ]
            },
            {
                "name": "Juice",
                "children": [
                    {"name": "Orange Juice"},
                    {"name": "Apple Juice"},
                    {"name": "Grape Juice"}
                ]
            }
        ]
    },
    {
        "name": "Snacks",
        "children": [
            {
                "name": "Chips",
                "children": [
                    {"name": "Potato Chips"},
                    {"name": "Corn Chips"},
                    {"name": "Tortilla Chips"}
                ]
            },
            {
                "name": "Cookies",
                "children": [
                    {"name": "Chocolate Chip"},
                    {"name": "Sandwich Cookies"},
                    {"name": "Butter Cookies"}
                ]
            },
            {
                "name": "Crackers",
                "children": [
                    {"name": "Saltine Crackers"},
                    {"name": "Cheese Crackers"},
                    {"name": "Whole Grain Crackers"}
                ]
            }
        ]
    },
    {
        "name": "Personal Care",
        "children": [
            {
                "name": "Soap",
                "children": [
                    {"name": "Bar Soap"},
                    {"name": "Liquid Soap"},
                    {"name": "Antibacterial Soap"}
                ]
            },
            {
                "name": "Shampoo",
                "children": [
                    {"name": "Anti-Dandruff"},
                    {"name": "Moisturizing"},
                    {"name": "Color Protection"}
                ]
            }
        ]
    },
    {
        "name": "Household Items",
        "children": [
            {
                "name": "Cleaning",
                "children": [
                    {"name": "All-Purpose Cleaners"},
                    {"name": "Bathroom Cleaners"},
                    {"name": "Kitchen Cleaners"}
                ]
            },
            {
                "name": "Laundry",
                "children": [
                    {"name": "Detergent"},
                    {"name": "Fabric Softener"},
                    {"name": "Stain Remover"}
                ]
            }
        ]
    }
]

def create_categories_table(conn):
    """Create categories table if it doesn't exist"""
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        level INTEGER NOT NULL,
        path TEXT,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
    )
    ''')
    conn.commit()

def insert_category(conn, category_id, name, parent_id=None, level=1, path=None):
    """Insert a category into the database"""
    cursor = conn.cursor()
    if path is None:
        path = name
    
    cursor.execute('''
    INSERT OR REPLACE INTO categories (id, name, parent_id, level, path)
    VALUES (?, ?, ?, ?, ?)
    ''', (category_id, name, parent_id, level, path))
    conn.commit()
    return category_id

def create_category_tree(conn, categories, parent_id=None, level=1):
    """Recursively create category tree"""
    for category in categories:
        # Create slug-like ID from name
        category_id = category["name"].lower().replace(" ", "-")
        if parent_id:
            category_id = f"{parent_id}-{category_id}"
            path = f"{parent_id} › {category['name']}"
        else:
            path = category["name"]
        
        # Insert category
        insert_category(conn, category_id, category["name"], parent_id, level, path)
        
        # Process children if any
        if "children" in category and category["children"]:
            create_category_tree(conn, category["children"], category_id, level + 1)

def main():
    """Main function"""
    print(f"Creating category tree in database: {DATABASE_PATH}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(DATABASE_PATH)
        
        # Create categories table
        create_categories_table(conn)
        
        # Create category tree
        create_category_tree(conn, CATEGORY_TREE)
        
        # Create view for category tree
        conn.execute('''
        CREATE VIEW IF NOT EXISTS vw_category_tree AS
        SELECT id, name, parent_id, level, path
        FROM categories
        ORDER BY path
        ''')
        
        conn.commit()
        print("Category tree created successfully!")
        
        # Print category count
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM categories")
        count = cursor.fetchone()[0]
        print(f"Total categories: {count}")
        
        # Print sample categories
        cursor.execute("SELECT id, name, parent_id, level, path FROM categories LIMIT 10")
        print("\nSample categories:")
        for row in cursor.fetchall():
            print(f"ID: {row[0]}, Name: {row[1]}, Parent: {row[2]}, Level: {row[3]}, Path: {row[4]}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return 1
    finally:
        if conn:
            conn.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())