from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
from dagster import DagsterInstance
import uvicorn

app = FastAPI(title="CES Monitor API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorStatus(BaseModel):
    name: str
    status: str
    lastRun: str
    metrics: Optional[dict] = None

class MetricHistory(BaseModel):
    timestamp: str
    accuracy: float
    latency: float
    throughput: float

# Initialize Dagster instance
instance = DagsterInstance.get()

@app.get("/api/sensors", response_model=List[SensorStatus])
async def get_sensors():
    """Get status of all Dagster sensors."""
    try:
        sensors = []
        for sensor in instance.get_job_snap(sensor=True):
            state = instance.get_job_state(sensor.selector)
            
            # Generate mock metrics for demo
            metrics = {
                "accuracy": random.uniform(0.85, 0.95),
                "latency": random.uniform(50, 200),
                "throughput": random.uniform(100, 500)
            }
            
            sensors.append(
                SensorStatus(
                    name=sensor.name,
                    status="OK" if state.last_run_success else "FAIL",
                    lastRun=state.last_run_time.isoformat() if state.last_run_time else datetime.now().isoformat(),
                    metrics=metrics
                )
            )
        return sensors
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/history", response_model=List[MetricHistory])
async def get_metric_history():
    """Get historical metrics for visualization."""
    try:
        # Generate mock historical data
        now = datetime.now()
        history = []
        
        for i in range(24):  # Last 24 hours
            timestamp = now - timedelta(hours=i)
            history.append(
                MetricHistory(
                    timestamp=timestamp.isoformat(),
                    accuracy=random.uniform(0.85, 0.95),
                    latency=random.uniform(50, 200),
                    throughput=random.uniform(100, 500)
                )
            )
        
        return sorted(history, key=lambda x: x.timestamp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000) 