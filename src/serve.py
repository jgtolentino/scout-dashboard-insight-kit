from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import pandas as pd
from typing import List, Dict
import joblib
from pathlib import Path
from .train import ModelTrainer
from .featurize import FeatureEngineering
import subprocess
from datetime import datetime

app = FastAPI(title="CES API")

# Load model and feature engineering
model_trainer = ModelTrainer()
feature_engineering = FeatureEngineering()

try:
    model_trainer.load_model()
except:
    print("No model found. Please train a model first.")

class CampaignData(BaseModel):
    title: str
    description: str
    metrics: Dict

class RetrainResponse(BaseModel):
    status: str
    job_id: str
    scheduled_time: str

@app.post("/predict")
async def predict_ces(data: CampaignData):
    """Predict CES score for a campaign."""
    try:
        # Extract features
        text_features = feature_engineering.extract_text_features([data.description])
        metrics_df = feature_engineering.calculate_metrics([data.metrics])
        features = feature_engineering.combine_features(text_features, metrics_df)
        
        # Make prediction
        prediction = model_trainer.model.predict(features)[0]
        
        return {
            "campaign_title": data.title,
            "predicted_ces": float(prediction)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance scores."""
    if model_trainer.feature_importance is None:
        raise HTTPException(
            status_code=404,
            detail="No feature importance data available. Please train a model first."
        )
    
    return model_trainer.feature_importance.to_dict(orient="records")

@app.post("/retrain", response_model=RetrainResponse)
async def trigger_retrain(background_tasks: BackgroundTasks):
    """Trigger a model retraining job."""
    try:
        # Generate unique job ID
        job_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Run training in background
        background_tasks.add_task(
            subprocess.run,
            ["dagster", "job", "execute", "-f", "pipelines/cs_ces_pipeline.py", "-j", "ces_rebuild_job"]
        )
        
        return RetrainResponse(
            status="scheduled",
            job_id=job_id,
            scheduled_time=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-status")
async def get_model_status():
    """Get current model status and metrics."""
    try:
        # Load latest model metrics
        metrics_path = Path("models/metrics.json")
        if metrics_path.exists():
            metrics = joblib.load(metrics_path)
        else:
            metrics = {
                "last_trained": None,
                "test_score": None,
                "train_score": None
            }
        
        return {
            "status": "ready" if model_trainer.model is not None else "not_trained",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 