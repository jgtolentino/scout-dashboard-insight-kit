-- Materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS transaction_volume_by_hour AS
SELECT date_trunc('hour', created_at) AS hour,
       COUNT(*)                     AS count,
       SUM(amount)                  AS sum_amount
FROM transactions
GROUP BY 1;

CREATE MATERIALIZED VIEW IF NOT EXISTS category_mix AS
SELECT category,
       COUNT(*) AS count,
       ROUND(100.0*COUNT(*)/SUM(COUNT(*)) OVER (),2) AS share
FROM transactions
GROUP BY 1;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_brand_id ON transactions (brand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions (store_id);

-- Row‑level security policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON transactions
  USING (auth.uid() = tenant_id);
