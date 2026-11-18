from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.services.data_service import DataService
from backend.services.forecast_service import ForecastService

router = APIRouter(prefix="/api")

# Services will be initialized in main.py and attached or instantiated
data_service: Optional[DataService] = None
forecast_service: Optional[ForecastService] = None

def init_services(ds: DataService, fs: ForecastService):
    global data_service, forecast_service
    data_service = ds
    forecast_service = fs

class ForecastRequest(BaseModel):
    station: str
    horizon: int = 30
    model: str = "best"

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "system": "Groundwater Level Prediction System API",
        "version": "1.0.0"
    }

@router.get("/locations")
def get_locations():
    if not data_service:
        raise HTTPException(status_code=500, detail="Data service not initialized")
    return data_service.get_locations_taxonomy()

@router.get("/stations")
def get_stations():
    if not data_service:
        raise HTTPException(status_code=500, detail="Data service not initialized")
    return data_service.get_stations_summary()

@router.get("/data")
def get_station_data(station: str = Query(..., description="Monitoring Station Name")):
    if not data_service:
        raise HTTPException(status_code=500, detail="Data service not initialized")
    data = data_service.get_station_data(station)
    if not data:
        raise HTTPException(status_code=404, detail=f"No observations found for station '{station}'")
    return {
        "station": station,
        "total_records": len(data),
        "observations": data
    }

@router.get("/statistics")
def get_statistics():
    if not data_service:
        raise HTTPException(status_code=500, detail="Data service not initialized")
    return data_service.stats

@router.post("/forecast")
def generate_forecast_endpoint(req: ForecastRequest):
    if not forecast_service:
        raise HTTPException(status_code=500, detail="Forecast service not initialized")
    try:
        res = forecast_service.generate_forecast(
            station_name=req.station,
            horizon=req.horizon,
            model_choice=req.model
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/model-performance")
def get_model_performance(station: str = Query(..., description="Monitoring Station Name")):
    if not forecast_service or not data_service:
        raise HTTPException(status_code=500, detail="Services not initialized")
    station_df = data_service.cleaned_df[data_service.cleaned_df["Station"] == station]
    if station_df.empty:
        raise HTTPException(status_code=404, detail=f"Station '{station}' not found")
    
    forecast_res = forecast_service.generate_forecast(station_name=station, horizon=12, model_choice="best")
    return forecast_res["evaluation"]

@router.get("/trends")
def get_trends(station: str = Query(..., description="Monitoring Station Name")):
    if not forecast_service:
        raise HTTPException(status_code=500, detail="Forecast service not initialized")
    res = forecast_service.get_trend_analysis(station)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not data_service:
        raise HTTPException(status_code=500, detail="Data service not initialized")
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    res = data_service.save_uploaded_csv(content, file.filename)
    
    if not res["success"]:
        raise HTTPException(status_code=400, detail=f"CSV validation failed: {res['errors']}")

    return {
        "message": "Dataset uploaded and processed successfully!",
        "details": res
    }
