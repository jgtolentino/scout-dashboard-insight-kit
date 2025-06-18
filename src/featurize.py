import pandas as pd
import numpy as np
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer

class FeatureEngineering:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
    
    def extract_text_features(self, texts: List[str]) -> pd.DataFrame:
        """Extract TF-IDF features from campaign descriptions."""
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        feature_names = self.vectorizer.get_feature_names_out()
        return pd.DataFrame(
            tfidf_matrix.toarray(),
            columns=feature_names
        )
    
    def calculate_metrics(self, metrics: List[Dict]) -> pd.DataFrame:
        """Calculate derived metrics from raw campaign data."""
        df = pd.DataFrame(metrics)
        # Add your metric calculations here
        return df
    
    def combine_features(self, text_features: pd.DataFrame, metrics: pd.DataFrame) -> pd.DataFrame:
        """Combine text and metric features."""
        return pd.concat([text_features, metrics], axis=1) 