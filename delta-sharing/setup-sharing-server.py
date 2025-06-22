#!/usr/bin/env python3
"""
Setup Delta Sharing server for Scout Analytics Gold layer
Provides secure, authenticated access to curated business data
"""

import json
import os
from pathlib import Path
import subprocess
import sys

def setup_delta_sharing():
    """Setup Delta Sharing server configuration"""
    
    print("🔗 Setting up Delta Sharing for Scout Analytics...")
    
    # Storage account configuration
    storage_account = "scoutanalyticsdata"
    base_url = f"abfss://gold@{storage_account}.dfs.core.windows.net"
    
    # Delta Sharing configuration
    sharing_config = {
        "shares": [
            {
                "name": "scout_analytics_public",
                "schemas": [
                    {
                        "name": "gold_layer",
                        "tables": [
                            {
                                "name": "transactions_summary",
                                "location": f"{base_url}/transactions/summary/",
                                "description": "Daily transaction summaries by region and category"
                            },
                            {
                                "name": "regional_kpis",
                                "location": f"{base_url}/regional/kpis/",
                                "description": "Regional performance metrics and growth indicators"
                            },
                            {
                                "name": "product_insights",
                                "location": f"{base_url}/products/insights/",
                                "description": "Product performance and substitution patterns"
                            },
                            {
                                "name": "customer_segments",
                                "location": f"{base_url}/customers/segments/",
                                "description": "Customer demographic and behavioral segments"
                            },
                            {
                                "name": "market_trends",
                                "location": f"{base_url}/trends/market/",
                                "description": "Market trend analysis and forecasting data"
                            }
                        ]
                    }
                ]
            }
        ],
        "version": "1.0",
        "authentication": {
            "type": "bearer_token",
            "required": True
        }
    }
    
    # Create delta-sharing directory
    sharing_dir = Path("delta-sharing")
    sharing_dir.mkdir(exist_ok=True)
    
    # Write sharing configuration
    config_path = sharing_dir / "shares.json"
    with open(config_path, 'w') as f:
        json.dump(sharing_config, f, indent=2)
    
    print(f"✅ Delta Sharing config created: {config_path}")
    
    # Create server configuration
    server_config = {
        "version": "1.0",
        "host": "0.0.0.0",
        "port": 8080,
        "shares_config_path": str(config_path.absolute()),
        "authorization": {
            "enabled": True,
            "bearer_tokens": [
                {
                    "token": "scout-analytics-public-token-2024",
                    "description": "Public access token for Scout Analytics Gold data"
                }
            ]
        },
        "cors": {
            "enabled": True,
            "allowed_origins": ["*"],
            "allowed_methods": ["GET", "POST", "OPTIONS"],
            "allowed_headers": ["Authorization", "Content-Type"]
        }
    }
    
    server_config_path = sharing_dir / "server-config.json"
    with open(server_config_path, 'w') as f:
        json.dump(server_config, f, indent=2)
    
    print(f"✅ Server config created: {server_config_path}")
    
    # Create requirements.txt for Delta Sharing
    requirements = """
delta-sharing[pandas,pyspark]>=0.6.0
fastapi>=0.68.0
uvicorn>=0.15.0
azure-storage-blob>=12.0.0
azure-identity>=1.7.0
"""
    
    requirements_path = sharing_dir / "requirements.txt"
    with open(requirements_path, 'w') as f:
        f.write(requirements.strip())
    
    print(f"✅ Requirements created: {requirements_path}")
    
    # Create startup script
    startup_script = f"""#!/bin/bash

# Delta Sharing Server Startup Script for Scout Analytics

echo "🚀 Starting Delta Sharing server for Scout Analytics..."

# Install dependencies
pip install -r delta-sharing/requirements.txt

# Set Azure credentials (ensure these are configured)
export AZURE_STORAGE_ACCOUNT="{storage_account}"
export AZURE_STORAGE_SAS_TOKEN="${{GOLD_SAS_TOKEN}}"

# Start Delta Sharing server
delta-sharing-server \\
  --config delta-sharing/server-config.json \\
  --host 0.0.0.0 \\
  --port 8080

echo "✅ Delta Sharing server running on http://localhost:8080"
echo "📊 Available shares:"
echo "   - scout_analytics_public.gold_layer.transactions_summary"
echo "   - scout_analytics_public.gold_layer.regional_kpis"
echo "   - scout_analytics_public.gold_layer.product_insights"
echo "   - scout_analytics_public.gold_layer.customer_segments"
echo "   - scout_analytics_public.gold_layer.market_trends"
echo ""
echo "🔑 Access token: scout-analytics-public-token-2024"
"""
    
    startup_path = sharing_dir / "start-server.sh"
    with open(startup_path, 'w') as f:
        f.write(startup_script)
    
    os.chmod(startup_path, 0o755)
    print(f"✅ Startup script created: {startup_path}")
    
    # Create client example
    client_example = f"""#!/usr/bin/env python3
\"\"\"
Example client for accessing Scout Analytics Gold data via Delta Sharing
\"\"\"

import delta_sharing
import pandas as pd

# Delta Sharing profile configuration
profile = {{
    "shareCredentialsVersion": 1,
    "endpoint": "http://localhost:8080/",  # Update with your server URL
    "bearerToken": "scout-analytics-public-token-2024"
}}

def main():
    print("📊 Scout Analytics Delta Sharing Client Example")
    
    try:
        # List available shares
        shares = delta_sharing.list_shares(profile)
        print(f"Available shares: {{[s.name for s in shares]}}")
        
        # List tables in the gold layer schema
        tables = delta_sharing.list_tables(profile, "scout_analytics_public.gold_layer")
        print(f"Available tables: {{[t.name for t in tables]}}")
        
        # Read transactions summary
        print("\\n📈 Loading transactions summary...")
        transactions_df = delta_sharing.load_as_pandas(
            profile, 
            "scout_analytics_public.gold_layer.transactions_summary"
        )
        print(f"Transactions data shape: {{transactions_df.shape}}")
        print(transactions_df.head())
        
        # Read regional KPIs
        print("\\n🗺️ Loading regional KPIs...")
        regional_df = delta_sharing.load_as_pandas(
            profile,
            "scout_analytics_public.gold_layer.regional_kpis"
        )
        print(f"Regional data shape: {{regional_df.shape}}")
        print(regional_df.head())
        
    except Exception as e:
        print(f"❌ Error accessing Delta Sharing: {{e}}")
        print("Make sure the Delta Sharing server is running!")

if __name__ == "__main__":
    main()
"""
    
    client_path = sharing_dir / "client-example.py"
    with open(client_path, 'w') as f:
        f.write(client_example)
    
    os.chmod(client_path, 0o755)
    print(f"✅ Client example created: {client_path}")
    
    # Create Docker configuration
    dockerfile = """FROM python:3.9-slim

WORKDIR /app

# Install Delta Sharing dependencies
COPY delta-sharing/requirements.txt .
RUN pip install -r requirements.txt

# Copy Delta Sharing configuration
COPY delta-sharing/ ./delta-sharing/

# Expose port
EXPOSE 8080

# Set environment variables
ENV PYTHONPATH=/app
ENV AZURE_STORAGE_ACCOUNT=scoutanalyticsdata

# Start Delta Sharing server
CMD ["delta-sharing-server", "--config", "delta-sharing/server-config.json", "--host", "0.0.0.0", "--port", "8080"]
"""
    
    dockerfile_path = sharing_dir / "Dockerfile"
    with open(dockerfile_path, 'w') as f:
        f.write(dockerfile)
    
    print(f"✅ Dockerfile created: {dockerfile_path}")
    
    print("\n🎉 Delta Sharing setup complete!")
    print("\n📋 Next steps:")
    print("   1. Run: ./delta-sharing/start-server.sh")
    print("   2. Test with: python ./delta-sharing/client-example.py")
    print("   3. Deploy to Azure Container Instances or App Service")
    print("   4. Update API endpoints to use Delta Sharing")
    print("\n🔗 Access URLs:")
    print("   Server: http://localhost:8080")
    print("   Token: scout-analytics-public-token-2024")

if __name__ == "__main__":
    setup_delta_sharing()