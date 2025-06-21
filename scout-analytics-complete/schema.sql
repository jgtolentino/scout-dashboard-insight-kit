CREATE TABLE transactions (
    created_at TEXT,
    total_amount REAL,
    customer_age INTEGER,
    customer_gender TEXT,
    store_location TEXT,
    store_id REAL,
    checkout_seconds INTEGER,
    is_weekend BOOLEAN,
    nlp_processed BOOLEAN,
    nlp_processed_at TEXT,
    nlp_confidence_score REAL,
    device_id TEXT,
    payment_method TEXT,
    checkout_time TEXT,
    request_type TEXT,
    transcription_text TEXT,
    suggestion_accepted BOOLEAN,
    transaction_id TEXT,
    customer_id TEXT
);

CREATE TABLE stores (
    name TEXT,
    location TEXT,
    barangay TEXT,
    city TEXT,
    region TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT,
    updated_at TEXT,
    store_id TEXT
);

CREATE TABLE devices (
    id TEXT,
    device_id TEXT,
    device_type TEXT,
    firmware_version TEXT,
    store_id REAL,
    status TEXT,
    registration_time TEXT,
    last_seen TEXT,
    metadata TEXT,
    location TEXT,
    network_info TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE customers (
    customer_id TEXT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    region TEXT,
    city TEXT,
    barangay TEXT,
    loyalty_tier TEXT,
    total_spent REAL,
    visit_count INTEGER,
    created_at TEXT
);

CREATE TABLE products (
    name TEXT,
    brand_id INTEGER,
    category TEXT,
    created_at TEXT
);

CREATE TABLE brands (
    name TEXT,
    category TEXT,
    is_tbwa BOOLEAN,
    created_at TEXT
);

CREATE TABLE transaction_items (
    transaction_id TEXT,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    unit_price REAL,
    created_at TEXT
);

CREATE TABLE request_behaviors (
    transaction_id TEXT,
    transaction_item_id INTEGER,
    request_type TEXT,
    request_method TEXT,
    suggestion_offered BOOLEAN,
    suggestion_accepted BOOLEAN,
    extracted_phrase TEXT,
    nlp_confidence REAL,
    nlp_model_version TEXT,
    processing_timestamp TEXT,
    raw_nlp_output TEXT,
    extracted_entities TEXT,
    created_at TEXT
);

CREATE TABLE substitutions (
    original_product_id INTEGER,
    substitute_product_id INTEGER,
    transaction_id TEXT,
    reason TEXT,
    created_at TEXT
);