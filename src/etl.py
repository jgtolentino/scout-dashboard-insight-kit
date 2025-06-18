import pandas as pd
from pathlib import Path
from typing import Optional

class DataIngestion:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def load_campaign_data(self, file_path: Optional[str] = None) -> pd.DataFrame:
        """Load campaign data from CSV or return empty DataFrame."""
        if file_path:
            return pd.read_csv(file_path)
        return pd.DataFrame(columns=[
            'campaign_id', 'brand', 'title', 'description',
            'launch_date', 'metrics', 'features'
        ])
    
    def save_processed_data(self, df: pd.DataFrame, filename: str) -> None:
        """Save processed data to CSV."""
        output_path = self.data_dir / filename
        df.to_csv(output_path, index=False)
        print(f"Saved processed data to {output_path}") 