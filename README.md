# Groundwater Level Prediction System

> **AI-powered groundwater monitoring and time-series forecasting for smarter water-resource planning**

![Groundwater Level Prediction System](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-teal?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-cyan?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwindcss)

---

## 1. Project Overview & Problem Statement

Accurate groundwater-level forecasting is essential for sustainable water resource management, agricultural planning, drought mitigation, and climate adaptation. Groundwater depletion across major agricultural belts in India poses severe risks to drinking water security and crop yields.

This project delivers an end-to-end, production-grade web application and machine learning time-series forecasting system that:
- Ingests multi-year groundwater level observations from **Central Ground Water Board (CGWB)** and **Digital Water Level Recorder (DWLR)** observation networks.
- Preprocesses time series, removes non-physical outliers, and imputes missing continuous values.
- Constructs temporal lag features (`lag_1` to `lag_30`), rolling statistics, and seasonal sinus/cosinus calendar encodings.
- Trains and compares four time-series models: **Naive Baseline**, **ARIMA / Holt-Winters Exponential Smoothing**, **Random Forest Regressor**, and **Gradient Boosting Regressor**.
- Evaluates models out-of-sample using strict **chronological 80/20 train-test validation** without future data leakage.
- Calculates **MAE**, **RMSE**, **R²**, and **MAPE** evaluation metrics and automatically selects the best model.
- Displays interactive forecasting charts with 95% confidence bounds, seasonal trend analysis, geospatial station map, and custom CSV dataset import.

---

## 2. Key System Features

| Feature Module | Description |
| :--- | :--- |
| **Interactive Dashboard** | High-level KPI cards, station switcher, groundwater status banner, and dual historical/forecast line chart preview. |
| **Data Explorer** | Browse raw DWLR dataset records, filter by state/district/station, and search observations. |
| **Forecasting Studio** | Horizon selector (7, 14, 30, 60, 90 days), algorithm selector, toggleable 95% confidence intervals, and interactive tooltips. |
| **Model Evaluation** | Actual vs Predicted overlay chart, out-of-sample metrics matrix (MAE, RMSE, R², MAPE), and natural language model selection rationale. |
| **Trend & Seasonal Analysis** | Pre vs Post monsoon seasonal variation bar charts, monthly distribution, and multi-year drawdown indicators. |
| **Station Geospatial Map** | Interactive Leaflet map displaying DWLR stations color-coded by depletion status (Normal, Watch, Low, Critical). |
| **CSV Dataset Upload** | Drag-and-drop CSV importer with strict schema validation, error alerts, preview, and model retraining. |
| **Academic Documentation** | Dedicated methodology report (`docs/methodology.md`) and EDA Jupyter Notebook (`notebooks/groundwater_analysis.ipynb`). |

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Environmental Glassmorphism Theme
- **Visualizations**: Recharts (Composed & Line Charts) + Leaflet / React-Leaflet (Geospatial Mapping)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.13 + FastAPI + Uvicorn
- **Data Manipulation**: Pandas, NumPy
- **Machine Learning & Time-Series**: Scikit-Learn (Random Forest & Gradient Boosting Regressors), Statsmodels (ARIMA & Exponential Smoothing)
- **Serialization & Utilities**: Joblib, Pydantic, Pytest

---

## 4. Dataset Architecture & CGWB/DWLR Standards

The dataset follows official **Central Ground Water Board (CGWB)** observation standards recorded in **meters below ground level (mbgl)**:

```text
Column Name     Description
--------------------------------------------------------------------
Date            Observation timestamp (YYYY-MM-DD)
State           Administrative State (e.g. Punjab, Rajasthan)
District        Administrative District (e.g. Amritsar, Jaipur)
Station         Unique DWLR Observation Station Name
Latitude        Geographic latitude coordinate (WGS84)
Longitude       Geographic longitude coordinate (WGS84)
Water_Level     Groundwater table depth in mbgl (higher = deeper/drier)
Unit            Measurement unit (mbgl)
```

> [!NOTE]
> **Demo Data Notice**: The application includes a multi-station sample dataset spanning 2018–2025 across Punjab, Rajasthan, Haryana, Uttar Pradesh, and Tamil Nadu. Users can upload official CGWB/DWLR CSV observation files directly via the **Upload Dataset** tab.

---

## 5. System Architecture

```text
groundwater-level-prediction/
│
├── frontend/                     # React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/           # Header, Sidebar, KpiCard, StatusBadge, ModelMetricsTable
│   │   ├── pages/                # Dashboard, DataExplorer, Forecast, ModelPerformance, TrendAnalysis, StationMap, DataUpload, About
│   │   ├── services/             # api.ts (Axios connection to FastAPI)
│   │   ├── types/                # groundwater.ts (TypeScript interfaces)
│   │   └── styles/               # index.css (Environmental glass theme)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python Application
│   ├── api/                      # REST Endpoints (/health, /locations, /stations, /forecast, /model-performance, /upload)
│   ├── preprocessing/            # cleaner.py, feature_engineering.py, validator.py
│   ├── forecasting/              # naive_model.py, arima_model.py, ml_models.py, evaluator.py
│   ├── services/                 # data_service.py, forecast_service.py
│   ├── utils/                    # config.py, logger.py, metrics.py
│   ├── main.py                   # FastAPI server entry point
│   └── requirements.txt
│
├── data/
│   ├── raw/                      # cgwb_dwlr_sample.csv (Authentic sample dataset)
│   └── README.md                 # Data documentation & schema specification
│
├── notebooks/
│   └── groundwater_analysis.ipynb # Jupyter notebook for offline EDA & baseline benchmarking
├── docs/
│   └── methodology.md            # Academic methodology & mathematical formulations report
├── tests/                        # Pytest suite for preprocessing, models, and endpoints
└── README.md
```

---

## 6. Installation & Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/groundwater-level-prediction.git
cd groundwater-level-prediction
```

### Step 2: Set Up Backend Virtual Environment
```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### Step 3: Set Up Frontend
```bash
cd frontend

# On Windows PowerShell:
cmd /c npm install

# On Linux/macOS:
npm install
```

---

## 7. How to Run the Application

### Start Backend API Server
```bash
# From root directory with virtual environment activated:
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### Start Frontend Development Server
```bash
# From frontend/ directory:
# On Windows PowerShell:
cmd /c npm run dev

# On Linux/macOS:
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. API Reference & Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint returning API system status |
| `/api/locations` | `GET` | Returns State $\rightarrow$ District $\rightarrow$ Station taxonomy hierarchy |
| `/api/stations` | `GET` | Returns list of stations with coordinates, latest level & status |
| `/api/data` | `GET` | Returns historical observations for specified station |
| `/api/forecast` | `POST` | Generates prediction series for station, horizon (7-90d), and model |
| `/api/model-performance` | `GET` | Returns out-of-sample evaluation metrics comparison |
| `/api/trends` | `GET` | Returns seasonal monthly patterns and multi-year trend direction |
| `/api/upload` | `POST` | Ingests uploaded CSV dataset, validates schema, and retrains models |

---

## 9. Running Tests

Run the complete Pytest backend test suite:
```bash
python -m pytest tests/
```

---

## 10. Recommended 2–4 Minute Exhibition Demonstration Sequence

For a university project evaluation or viva panel demonstration:

1. **Dashboard & Problem Statement [0:00 - 0:45]**:
   - Open `http://localhost:5173`.
   - Point out the core problem: severe aquifer drawdown across agricultural zones (Punjab, Rajasthan).
   - Show the 6 KPI cards, status badge, and the Demo Mode disclosure notice.
   - Switch location between *Amritsar Central* (Punjab) and *Jaipur West* (Rajasthan) to show live reactivity.
2. **Seasonal & Multi-Year Trends [0:45 - 1:30]**:
   - Open **Trend Analysis**.
   - Show the 6 statistical metrics (Min, Max, Mean, Median, Std Dev, Recent Change).
   - Explain the computed insights: peak drawdown in summer (May) vs monsoon recharge recovery (November).
3. **Model Performance & Academic Rigor [1:30 - 2:15]**:
   - Open **Model Performance**.
   - Review the 4-Model Comparative Matrix (Naive Baseline, ARIMA, Random Forest, Gradient Boosting).
   - Hover over RMSE and R² to show the interactive `VivaTooltip` definitions.
   - Highlight the **Holdout Validation** chart and explain why chronological splitting is mandatory for time-series.
4. **Forecasting Studio [2:15 - 3:00]**:
   - Open **Forecast**.
   - Select a 30-day or 60-day horizon and click **Generate Forecast**.
   - Review the forecast result card: Latest Level $\rightarrow$ Forecast Endpoint $\rightarrow$ Net Expected Shift.
   - Show the 95% Confidence Interval band and read the automated narrative interpretation.
5. **Geospatial Telemetry & Data Ingestion [3:00 - 3:30]**:
   - Open **Station Map** to inspect geographic nodes color-coded by depletion risk.
   - Open **Upload Dataset** to show how custom CGWB CSV observation files can be ingested.

---

## 11. Top 10 Viva Defence Talking Points

1. **Why is groundwater level measured in mbgl?**
   *mbgl* stands for *meters below ground level* (depth to the water table). Lower numbers (e.g. 5–10m) indicate a shallow, healthy water table; higher numbers (e.g. 30–45m) indicate deep depletion.
2. **Why time-series forecasting instead of standard tabular machine learning?**
   Groundwater observations are ordered sequentially over time. Autoregressive memory and seasonal monsoon precipitation cycles govern depth trajectories, which cross-sectional models ignore.
3. **How did you prevent data leakage?**
   We avoided random k-fold shuffling. The observation timeline was partitioned chronologically (initial 80% for training, final 20% holdout test window) to mimic operational forecasting conditions.
4. **Why include a Naive Baseline model?**
   A baseline (persisting the last value or the same month from the prior year) establishes the minimum performance floor. Any ML model must outperform this baseline in out-of-sample RMSE to justify deployment.
5. **How does the multi-step recursive forecasting work?**
   For horizons up to 90 days, each predicted point is appended back into the series to dynamically construct lag features (`lag_1`, `lag_2`, `lag_7`, etc.) for the next step.
6. **How are the confidence intervals calculated?**
   Confidence bounds are computed using the in-sample residual standard deviation ($\sigma_e$) scaled by $\pm 1.96$ (for a 95% interval) with a horizon expansion factor: $\pm 1.96 \cdot \sigma_e \sqrt{1 + 0.06 \cdot h}$.
7. **What feature engineering was performed?**
   We created autoregressive lags (1, 2, 3, 7, 14, 30), rolling window statistics (3-month and 6-month means and standard deviations), and cyclical trigonometric month encodings ($\sin/\cos$) to model annual monsoon cycles.
8. **Why evaluate both MAE and RMSE?**
   MAE gives the average absolute error in meters, while RMSE penalizes larger deviations more heavily, which is crucial for identifying dangerous water table drops.
9. **How does the system handle missing data in uploaded CSVs?**
   The pipeline sorts the data chronologically, aggregates same-day duplicates by mean while preserving metadata, and applies forward-fill followed by linear interpolation.
10. **What is the scientific distinction between this demo and operational deployment?**
    The system ships with a synthetic demonstration dataset matching official CGWB schemas for reproducibility. Operational deployment requires importing verified field telemetry via the provided upload interface.

---

## 12. Scientific Disclaimer

> “Groundwater-level forecasts are statistical approximations based on historical telemetry observations and mathematical model assumptions. Predictions should support, not replace, expert hydrological assessment and official water-resource management decisions.”

---

## 13. Author & Acknowledgments

Developed as a University / College Final-Year Academic Project demonstrating full-stack engineering, time-series data science, and modern UX design.

