import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.config import DEFAULT_DATASET
from backend.services.data_service import DataService
from backend.services.forecast_service import ForecastService
from backend.api.routes import router, init_services

app = FastAPI(
    title="Groundwater Level Prediction System API",
    description="AI-powered groundwater monitoring and time-series forecasting backend.",
    version="1.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
data_service = DataService(str(DEFAULT_DATASET))
forecast_service = ForecastService(data_service)
init_services(data_service, forecast_service)

app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "Groundwater Level Prediction System API is running.",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
