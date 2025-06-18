import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
import shap
import joblib
from pathlib import Path
from typing import Tuple, Dict

class ModelTrainer:
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        self.model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )
        self.feature_importance = None
    
    def prepare_data(self, df: pd.DataFrame, target_col: str) -> Tuple:
        """Split data into train/test sets."""
        X = df.drop(columns=[target_col])
        y = df[target_col]
        return train_test_split(X, y, test_size=0.2, random_state=42)
    
    def train(self, X_train: pd.DataFrame, y_train: pd.Series) -> None:
        """Train the model and calculate feature importance."""
        self.model.fit(X_train, y_train)
        
        # Calculate SHAP values
        explainer = shap.TreeExplainer(self.model)
        shap_values = explainer.shap_values(X_train)
        
        # Store feature importance
        self.feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': np.abs(shap_values).mean(axis=0)
        }).sort_values('importance', ascending=False)
    
    def save_model(self, filename: str = "ces_model.joblib") -> None:
        """Save model and feature importance."""
        model_path = self.model_dir / filename
        joblib.dump(self.model, model_path)
        
        if self.feature_importance is not None:
            importance_path = self.model_dir / "feature_importance.csv"
            self.feature_importance.to_csv(importance_path, index=False)
    
    def load_model(self, filename: str = "ces_model.joblib") -> None:
        """Load a saved model."""
        model_path = self.model_dir / filename
        self.model = joblib.load(model_path)
        
        importance_path = self.model_dir / "feature_importance.csv"
        if importance_path.exists():
            self.feature_importance = pd.read_csv(importance_path) 