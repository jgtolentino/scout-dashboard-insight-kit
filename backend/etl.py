import pandas as pd
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime
import os
import json

Base = declarative_base()

class ETLPipeline:
    def __init__(self, db_url='sqlite:///analytics.db'):
        self.engine = create_engine(db_url)
        self.metadata = MetaData()
        
    def create_tables(self):
        """Create database tables if they don't exist"""
        # Regions table
        regions = Table('regions', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(100)),
            Column('parent_region_id', Integer),
            Column('level', String(20)),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        
        # Products table
        products = Table('products', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('sku', String(50), unique=True),
            Column('name', String(200)),
            Column('category', String(100)),
            Column('brand', String(100)),
            Column('price', Float),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        
        # Customers table
        customers = Table('customers', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('customer_code', String(50), unique=True),
            Column('name', String(200)),
            Column('region_id', Integer, ForeignKey('regions.id')),
            Column('segment', String(50)),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        
        # Transactions table
        transactions = Table('transactions', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('transaction_id', String(50), unique=True),
            Column('date', DateTime),
            Column('customer_id', Integer, ForeignKey('customers.id')),
            Column('store_id', String(50)),
            Column('total_amount', Float),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        
        # Transaction items table
        transaction_items = Table('transaction_items', self.metadata,
            Column('id', Integer, primary_key=True),
            Column('transaction_id', Integer, ForeignKey('transactions.id')),
            Column('product_id', Integer, ForeignKey('products.id')),
            Column('quantity', Integer),
            Column('unit_price', Float),
            Column('total_price', Float),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        
        self.metadata.create_all(self.engine)
        
    def load_csv_data(self, file_path, table_name):
        """Load data from CSV file into database table"""
        try:
            df = pd.read_csv(file_path)
            df.to_sql(table_name, self.engine, if_exists='replace', index=False)
            print(f"Loaded {len(df)} rows into {table_name}")
            return True
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
            return False
    
    def load_json_data(self, file_path, table_name):
        """Load data from JSON file into database table"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            df = pd.DataFrame(data)
            df.to_sql(table_name, self.engine, if_exists='replace', index=False)
            print(f"Loaded {len(df)} rows into {table_name}")
            return True
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
            return False
    
    def generate_sample_data(self):
        """Generate sample data for testing"""
        # Sample regions
        regions_data = [
            {'id': 1, 'name': 'Philippines', 'parent_region_id': None, 'level': 'country'},
            {'id': 2, 'name': 'NCR', 'parent_region_id': 1, 'level': 'region'},
            {'id': 3, 'name': 'Region IV-A', 'parent_region_id': 1, 'level': 'region'},
            {'id': 4, 'name': 'Region III', 'parent_region_id': 1, 'level': 'region'},
            {'id': 5, 'name': 'Manila', 'parent_region_id': 2, 'level': 'city'},
            {'id': 6, 'name': 'Quezon City', 'parent_region_id': 2, 'level': 'city'},
            {'id': 7, 'name': 'Cavite', 'parent_region_id': 3, 'level': 'province'},
            {'id': 8, 'name': 'Laguna', 'parent_region_id': 3, 'level': 'province'},
        ]
        
        # Sample products
        products_data = [
            {'id': 1, 'sku': 'RICE-001', 'name': 'Jasmine Rice 5kg', 'category': 'Rice', 'brand': 'Royal Harvest', 'price': 280.00},
            {'id': 2, 'sku': 'NOOD-001', 'name': 'Lucky Me Pancit Canton Original', 'category': 'Noodles', 'brand': 'Lucky Me', 'price': 12.00},
            {'id': 3, 'sku': 'SOAP-001', 'name': 'Safeguard White 135g', 'category': 'Personal Care', 'brand': 'Safeguard', 'price': 35.00},
            {'id': 4, 'sku': 'DTRG-001', 'name': 'Tide Original 1kg', 'category': 'Detergent', 'brand': 'Tide', 'price': 115.00},
            {'id': 5, 'sku': 'BEVG-001', 'name': 'Coca Cola 1.5L', 'category': 'Beverages', 'brand': 'Coca Cola', 'price': 65.00},
        ]
        
        # Sample customers
        customers_data = [
            {'id': 1, 'customer_code': 'CUST-001', 'name': 'Sari-Sari Store A', 'region_id': 5, 'segment': 'Traditional Trade'},
            {'id': 2, 'customer_code': 'CUST-002', 'name': 'Mini Mart B', 'region_id': 6, 'segment': 'Modern Trade'},
            {'id': 3, 'customer_code': 'CUST-003', 'name': 'Neighborhood Store C', 'region_id': 7, 'segment': 'Traditional Trade'},
        ]
        
        # Convert to DataFrames and save
        pd.DataFrame(regions_data).to_sql('regions', self.engine, if_exists='replace', index=False)
        pd.DataFrame(products_data).to_sql('products', self.engine, if_exists='replace', index=False)
        pd.DataFrame(customers_data).to_sql('customers', self.engine, if_exists='replace', index=False)
        
        print("Sample data generated successfully")
        
    def run_etl(self, data_dir='../data'):
        """Run the complete ETL pipeline"""
        print("Starting ETL pipeline...")
        
        # Create tables
        self.create_tables()
        
        # Check if data files exist
        data_files = {
            'regions': ['regions.csv', 'regions.json'],
            'products': ['products.csv', 'products.json'],
            'customers': ['customers.csv', 'customers.json'],
            'transactions': ['philippines_transactions.csv', 'transactions.json'],
        }
        
        data_loaded = False
        
        for table, files in data_files.items():
            for file in files:
                file_path = os.path.join(data_dir, file)
                if os.path.exists(file_path):
                    if file.endswith('.csv'):
                        data_loaded = self.load_csv_data(file_path, table) or data_loaded
                    else:
                        data_loaded = self.load_json_data(file_path, table) or data_loaded
                    break
        
        # If no data files found, generate sample data
        if not data_loaded:
            print("No data files found. Generating sample data...")
            self.generate_sample_data()
        
        print("ETL pipeline completed")

if __name__ == '__main__':
    etl = ETLPipeline()
    etl.run_etl()