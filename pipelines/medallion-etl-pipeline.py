#!/usr/bin/env python3
"""
Scout Analytics Medallion ETL Pipeline
Implements Bronze → Silver → Gold data transformation following best practices

Data Flow:
1. Bronze: Raw TBWA Project Scout data ingestion
2. Silver: Data cleaning, validation, and conforming
3. Gold: Business-ready aggregations and curated datasets
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import *
from pyspark.sql.types import *
from delta import configure_spark_with_delta_pip

class MedallionETLPipeline:
    """Scout Analytics Medallion Architecture ETL Pipeline"""
    
    def __init__(self, storage_account: str = "scoutanalyticsdata"):
        self.storage_account = storage_account
        self.spark = self._create_spark_session()
        
        # Layer configurations
        self.layers = {
            'bronze': f"abfss://bronze@{storage_account}.dfs.core.windows.net",
            'silver': f"abfss://silver@{storage_account}.dfs.core.windows.net", 
            'gold': f"abfss://gold@{storage_account}.dfs.core.windows.net"
        }
        
        print(f"🏛️ Medallion ETL Pipeline initialized for {storage_account}")
    
    def _create_spark_session(self) -> SparkSession:
        """Create Spark session with Delta Lake support"""
        
        builder = SparkSession.builder \
            .appName("ScoutAnalyticsMedallionETL") \
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
            .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
        
        # Configure Azure storage access
        if os.getenv('AZURE_STORAGE_ACCOUNT_KEY'):
            builder = builder.config(
                f"fs.azure.account.key.{self.storage_account}.dfs.core.windows.net",
                os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
            )
        
        spark = configure_spark_with_delta_pip(builder).getOrCreate()
        spark.sparkContext.setLogLevel("WARN")
        
        return spark
    
    def bronze_ingestion(self, source_config: Dict) -> None:
        """
        Bronze Layer: Raw data ingestion from TBWA Project Scout
        🔴 PRIVATE ACCESS - ETL processes only
        """
        print("🔴 Bronze Layer: Ingesting raw data...")
        
        # Read from TBWA Project Scout database
        transactions_df = self.spark.read \
            .format("jdbc") \
            .option("url", source_config['jdbc_url']) \
            .option("dbtable", "transactions") \
            .option("user", source_config['username']) \
            .option("password", source_config['password']) \
            .load()
        
        # Add ingestion metadata
        bronze_df = transactions_df \
            .withColumn("ingestion_timestamp", current_timestamp()) \
            .withColumn("source_system", lit("tbwa_project_scout")) \
            .withColumn("data_quality_score", lit(1.0))
        
        # Write to Bronze layer (append mode for incremental loads)
        bronze_path = f"{self.layers['bronze']}/transactions/raw"
        bronze_df.write \
            .format("delta") \
            .mode("append") \
            .option("mergeSchema", "true") \
            .save(bronze_path)
        
        print(f"✅ Bronze ingestion complete: {bronze_df.count()} records")
    
    def silver_transformation(self) -> None:
        """
        Silver Layer: Data cleaning, validation, and conforming
        🟡 INTERNAL ACCESS - Data engineering team only
        """
        print("🟡 Silver Layer: Cleaning and conforming data...")
        
        # Read from Bronze
        bronze_path = f"{self.layers['bronze']}/transactions/raw"
        bronze_df = self.spark.read.format("delta").load(bronze_path)
        
        # Data cleaning and validation
        silver_df = bronze_df \
            .filter(col("total_amount") > 0) \
            .filter(col("quantity") > 0) \
            .filter(col("customer_id").isNotNull()) \
            .withColumn("transaction_date", to_date(col("timestamp"))) \
            .withColumn("transaction_hour", hour(col("timestamp"))) \
            .withColumn("transaction_day_of_week", dayofweek(col("timestamp"))) \
            .withColumn("amount_per_unit", col("total_amount") / col("quantity")) \
            .withColumn("region_normalized", 
                       when(col("region") == "NCR", "National Capital Region")
                       .when(col("region") == "CAR", "Cordillera Administrative Region")
                       .otherwise(col("region"))) \
            .withColumn("category_standardized", 
                       lower(trim(col("category")))) \
            .withColumn("processed_timestamp", current_timestamp()) \
            .withColumn("data_quality_score", 
                       when((col("total_amount") > 0) & 
                            (col("quantity") > 0) & 
                            (col("customer_id").isNotNull()), 1.0)
                       .otherwise(0.8))
        
        # Write to Silver layer (merge for SCD Type 1)
        silver_path = f"{self.layers['silver']}/transactions/cleaned"
        silver_df.write \
            .format("delta") \
            .mode("overwrite") \
            .option("overwriteSchema", "true") \
            .save(silver_path)
        
        print(f"✅ Silver transformation complete: {silver_df.count()} records")
    
    def gold_curation(self) -> None:
        """
        Gold Layer: Business-ready aggregations and curated datasets
        🟢 PUBLIC ACCESS - Exposed via APIs and Delta Sharing
        """
        print("🟢 Gold Layer: Creating business-ready datasets...")
        
        # Read from Silver
        silver_path = f"{self.layers['silver']}/transactions/cleaned"
        silver_df = self.spark.read.format("delta").load(silver_path)
        
        # 1. Transactions Summary (Daily aggregates)
        self._create_transactions_summary(silver_df)
        
        # 2. Regional KPIs
        self._create_regional_kpis(silver_df)
        
        # 3. Product Insights
        self._create_product_insights(silver_df)
        
        # 4. Customer Segments
        self._create_customer_segments(silver_df)
        
        # 5. Market Trends
        self._create_market_trends(silver_df)
        
        print("✅ Gold curation complete - All business datasets ready")
    
    def _create_transactions_summary(self, silver_df: DataFrame) -> None:
        """Create daily transaction summary for Gold layer"""
        
        summary_df = silver_df \
            .groupBy("transaction_date", "region_normalized", "category_standardized") \
            .agg(
                sum("total_amount").alias("total_amount"),
                count("id").alias("transaction_count"),
                avg("total_amount").alias("avg_order_value"),
                countDistinct("customer_id").alias("unique_customers"),
                min("timestamp").alias("first_transaction"),
                max("timestamp").alias("last_transaction")
            ) \
            .withColumn("created_at", current_timestamp()) \
            .withColumnRenamed("region_normalized", "region") \
            .withColumnRenamed("category_standardized", "category")
        
        gold_path = f"{self.layers['gold']}/transactions/summary"
        summary_df.write \
            .format("delta") \
            .mode("overwrite") \
            .save(gold_path)
        
        print(f"   📊 Transactions summary: {summary_df.count()} records")
    
    def _create_regional_kpis(self, silver_df: DataFrame) -> None:
        """Create regional performance KPIs"""
        
        # Calculate weekly regional performance
        regional_df = silver_df \
            .withColumn("week_start", date_trunc("week", col("transaction_date"))) \
            .groupBy("week_start", "region_normalized") \
            .agg(
                sum("total_amount").alias("revenue"),
                count("id").alias("transaction_count"),
                countDistinct("customer_id").alias("unique_customers"),
                avg("total_amount").alias("avg_order_value")
            ) \
            .withColumn("growth_rate", lit(0.0))  # TODO: Calculate vs previous period
        
        # Add market share calculation
        window_spec = Window.partitionBy("week_start")
        regional_kpis = regional_df \
            .withColumn("total_market_revenue", sum("revenue").over(window_spec)) \
            .withColumn("market_share", 
                       round((col("revenue") / col("total_market_revenue")) * 100, 2)) \
            .withColumn("created_at", current_timestamp()) \
            .withColumnRenamed("week_start", "period") \
            .withColumnRenamed("region_normalized", "region") \
            .drop("total_market_revenue")
        
        gold_path = f"{self.layers['gold']}/regional/kpis"
        regional_kpis.write \
            .format("delta") \
            .mode("overwrite") \
            .save(gold_path)
        
        print(f"   🗺️ Regional KPIs: {regional_kpis.count()} records")
    
    def _create_product_insights(self, silver_df: DataFrame) -> None:
        """Create product performance and substitution insights"""
        
        product_df = silver_df \
            .groupBy("product_name", "category_standardized") \
            .agg(
                sum("total_amount").alias("revenue"),
                sum("quantity").alias("units_sold"),
                count("id").alias("transaction_count"),
                countDistinct("customer_id").alias("unique_customers"),
                avg("amount_per_unit").alias("avg_unit_price")
            ) \
            .withColumn("substitution_score", rand() * 100)  # TODO: Calculate actual substitution
        
        # Rank products within categories
        window_spec = Window.partitionBy("category_standardized").orderBy(desc("revenue"))
        product_insights = product_df \
            .withColumn("category_rank", row_number().over(window_spec)) \
            .withColumn("created_at", current_timestamp()) \
            .withColumnRenamed("category_standardized", "category") \
            .withColumn("product_id", monotonically_increasing_id().cast("string"))
        
        gold_path = f"{self.layers['gold']}/products/insights"
        product_insights.write \
            .format("delta") \
            .mode("overwrite") \
            .save(gold_path)
        
        print(f"   🛍️ Product insights: {product_insights.count()} records")
    
    def _create_customer_segments(self, silver_df: DataFrame) -> None:
        """Create customer demographic and behavioral segments"""
        
        # Customer behavior analysis
        customer_df = silver_df \
            .groupBy("customer_id", "region_normalized") \
            .agg(
                sum("total_amount").alias("total_spend"),
                count("id").alias("visit_frequency"),
                avg("total_amount").alias("avg_spend"),
                collect_set("category_standardized").alias("preferred_categories"),
                min("transaction_date").alias("first_purchase"),
                max("transaction_date").alias("last_purchase")
            ) \
            .withColumn("customer_lifetime", 
                       datediff(col("last_purchase"), col("first_purchase"))) \
            .withColumn("spend_segment",
                       when(col("total_spend") > 10000, "High Value")
                       .when(col("total_spend") > 5000, "Medium Value")
                       .otherwise("Low Value")) \
            .withColumn("frequency_segment",
                       when(col("visit_frequency") > 20, "Frequent")
                       .when(col("visit_frequency") > 5, "Regular")
                       .otherwise("Occasional"))
        
        # Create segments
        segments_df = customer_df \
            .withColumn("segment_id", 
                       concat(col("spend_segment"), lit("_"), col("frequency_segment"))) \
            .withColumn("created_at", current_timestamp()) \
            .withColumnRenamed("region_normalized", "region")
        
        gold_path = f"{self.layers['gold']}/customers/segments"
        segments_df.write \
            .format("delta") \
            .mode("overwrite") \
            .save(gold_path)
        
        print(f"   👥 Customer segments: {segments_df.count()} records")
    
    def _create_market_trends(self, silver_df: DataFrame) -> None:
        """Create market trend analysis and forecasting data"""
        
        # Daily trend analysis
        trends_df = silver_df \
            .groupBy("transaction_date", "category_standardized") \
            .agg(
                sum("total_amount").alias("daily_revenue"),
                count("id").alias("daily_transactions"),
                avg("total_amount").alias("daily_avg_order")
            ) \
            .withColumn("trend_type", lit("daily_revenue")) \
            .withColumn("trend_value", col("daily_revenue")) \
            .withColumn("confidence_score", lit(0.95)) \
            .withColumn("forecast_period", lit(30)) \
            .withColumn("created_at", current_timestamp()) \
            .withColumnRenamed("transaction_date", "trend_date") \
            .withColumnRenamed("category_standardized", "category") \
            .select("trend_date", "category", "trend_type", "trend_value", 
                   "confidence_score", "forecast_period", "created_at")
        
        gold_path = f"{self.layers['gold']}/trends/market"
        trends_df.write \
            .format("delta") \
            .mode("overwrite") \
            .save(gold_path)
        
        print(f"   📈 Market trends: {trends_df.count()} records")
    
    def run_full_pipeline(self, source_config: Dict) -> None:
        """Execute the complete medallion pipeline"""
        
        print("🚀 Starting Scout Analytics Medallion ETL Pipeline...")
        print(f"   Storage Account: {self.storage_account}")
        print(f"   Timestamp: {datetime.now()}")
        print("")
        
        try:
            # Bronze → Silver → Gold
            self.bronze_ingestion(source_config)
            self.silver_transformation()
            self.gold_curation()
            
            print("")
            print("🎉 Medallion ETL Pipeline completed successfully!")
            print("")
            print("📂 Data Layer Summary:")
            print(f"   🔴 Bronze: {self.layers['bronze']} (PRIVATE)")
            print(f"   🟡 Silver: {self.layers['silver']} (INTERNAL)")
            print(f"   🟢 Gold: {self.layers['gold']} (PUBLIC)")
            
        except Exception as e:
            print(f"❌ Pipeline failed: {e}")
            raise
        finally:
            self.spark.stop()

def main():
    """Main execution function"""
    
    # Source configuration (TBWA Project Scout)
    source_config = {
        'jdbc_url': os.getenv('SCOUT_JDBC_URL', 'jdbc:sqlserver://tbwa-scout.database.windows.net:1433;database=ProjectScout'),
        'username': os.getenv('SCOUT_DB_USERNAME'),
        'password': os.getenv('SCOUT_DB_PASSWORD')
    }
    
    # Validate configuration
    if not all([source_config['username'], source_config['password']]):
        print("❌ Missing database credentials. Set SCOUT_DB_USERNAME and SCOUT_DB_PASSWORD")
        sys.exit(1)
    
    # Run pipeline
    pipeline = MedallionETLPipeline()
    pipeline.run_full_pipeline(source_config)

if __name__ == "__main__":
    main()