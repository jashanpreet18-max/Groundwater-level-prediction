from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_locations_endpoint():
    response = client.get("/api/locations")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_stations_endpoint():
    response = client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert isinstance(stations, list)
    assert len(stations) > 0

def test_forecast_endpoint():
    stations_res = client.get("/api/stations")
    station_name = stations_res.json()[0]["station"]
    
    payload = {
        "station": station_name,
        "horizon": 12,
        "model": "best"
    }
    response = client.post("/api/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert len(data["forecast"]) == 12
    assert "evaluation" in data
