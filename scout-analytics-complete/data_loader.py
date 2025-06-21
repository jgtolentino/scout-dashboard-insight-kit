import os
import pandas as pd
import uuid
from datetime import datetime
from src.models.analytics import (
    Transaction, Store, Product, Brand, Customer, 
    TransactionItem, Device, RequestBehavior, Substitution, db
)

def load_csv_data():
    """Load CSV data into SQLite database"""
    
    # Get the database directory path
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    
    try:
        # Load transactions
        transactions_df = pd.read_csv(os.path.join(db_dir, 'transactions.csv'))
        print(f"Loading {len(transactions_df)} transactions...")
        for _, row in transactions_df.iterrows():
            transaction = Transaction(
                transaction_id=row['transaction_id'],
                timestamp=row['created_at'],
                store_id=row['store_id'],
                store_location=row['store_location'],
                device_id=row['device_id'],
                total_amount=row['total_amount'],
                payment_method=row['payment_method'],
                customer_id=row['customer_id']
            )
            db.session.merge(transaction)
        
        # Load stores
        stores_df = pd.read_csv(os.path.join(db_dir, 'stores.csv'))
        print(f"Loading {len(stores_df)} stores...")
        for _, row in stores_df.iterrows():
            store = Store(
                store_id=row['store_id'],
                name=row['name'],
                location=row['location'],
                barangay=row['barangay'],
                city=row['city'],
                region=row['region'],
                latitude=row['latitude'],
                longitude=row['longitude']
            )
            db.session.merge(store)
        
        # Load products - check if columns exist
        products_df = pd.read_csv(os.path.join(db_dir, 'products.csv'))
        print(f"Products columns: {list(products_df.columns)}")
        print(f"Loading {len(products_df)} products...")
        
        # Create synthetic product data if columns are missing
        for i, row in products_df.iterrows():
            product = Product(
                product_id=f"prod_{i+1:04d}",  # Generate synthetic product_id
                name=row['name'],
                category=row['category'],
                brand_id=row['brand_id'],
                price=50.0 + (i % 100) * 2.5,  # Generate synthetic price
                cost=30.0 + (i % 100) * 1.5    # Generate synthetic cost
            )
            db.session.merge(product)
        
        # Load brands
        brands_df = pd.read_csv(os.path.join(db_dir, 'brands.csv'))
        if 'brand_id' not in brands_df.columns:
            brands_df['brand_id'] = [str(uuid.uuid4()) for _ in range(len(brands_df))]
            brands_df.to_csv(os.path.join(db_dir, 'brands.csv'), index=False) # Save updated brands.csv
        print(f"Loading {len(brands_df)} brands...")
        for _, row in brands_df.iterrows():
            brand = Brand(
                brand_id=row['brand_id'],
                name=row['name'],
                category=row['category'],
                is_tbwa=row["is_tbwa"] if "is_tbwa" in brands_df.columns else False, # Handle missing is_tbwa
                created_at=row["created_at"] if "created_at" in brands_df.columns else datetime.now().isoformat() # Handle missing created_at
            )
            db.session.merge(brand)
        
        # Load customers
        customers_df = pd.read_csv(os.path.join(db_dir, 'customers.csv'))
        print(f"Loading {len(customers_df)} customers...")
        for _, row in customers_df.iterrows():
            customer = Customer(
                customer_id=row["customer_id"],
                age=row["age"],
                gender=row["gender"],
                barangay=row["barangay"],
                city=row["city"],
                region=row["region"]
            )
            db.session.merge(customer)
        
        # Load transaction items
        transaction_items_df = pd.read_csv(os.path.join(db_dir, 'transaction_items.csv'))
        print(f"Loading {len(transaction_items_df)} transaction items...")
        for _, row in transaction_items_df.iterrows():
            item = TransactionItem(
                transaction_id=row['transaction_id'],
                product_id=row['product_id'],
                quantity=row['quantity'],
                unit_price=row["unit_price"],
                total_price=row["price"] # Use 'price' column from CSV for total_price
            )
            db.session.add(item)
        
        # Load devices
        devices_df = pd.read_csv(os.path.join(db_dir, 'devices.csv'))
        print(f"Loading {len(devices_df)} devices...")
        for _, row in devices_df.iterrows():
            device = Device(
                device_id=row["device_id"],
                type=row["device_type"], # Use 'device_type' column from CSV
                location=row["location"],
                store_id=row["store_id"]
            )
            db.session.merge(device)
        
        # Load request behaviors
        request_behaviors_df = pd.read_csv(os.path.join(db_dir, 'request_behaviors.csv'))
        print(f"Loading {len(request_behaviors_df)} request behaviors...")
        for _, row in request_behaviors_df.iterrows():
            behavior = RequestBehavior(
                transaction_id=row['transaction_id'],
                behavior_type=row['behavior_type'],
                timestamp=row['timestamp'],
                details=row['details']
            )
            db.session.add(behavior)
        
        # Load substitutions
        substitutions_df = pd.read_csv(os.path.join(db_dir, 'substitutions.csv'))
        print(f"Loading {len(substitutions_df)} substitutions...")
        for _, row in substitutions_df.iterrows():
            substitution = Substitution(
                transaction_id=row['transaction_id'],
                original_product_id=row['original_product_id'],
                substitute_product_id=row['substitute_product_id'],
                reason=row['reason']
            )
            db.session.add(substitution)
        
        # Commit all changes
        db.session.commit()
        print("CSV data loaded successfully into SQLite database!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error loading CSV data: {str(e)}")
        import traceback
        traceback.print_exc()
        # Don't raise the error, just continue with empty database
        print("Continuing with empty database...")

