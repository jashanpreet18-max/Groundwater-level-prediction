# Groundwater Level Observation Dataset

## 1. Overview & Data Source
This dataset structure follows official observation standards established by the **Central Ground Water Board (CGWB)** and **Digital Water Level Recorder (DWLR)** networks in India. 

Groundwater level measurements monitor the depth to the water table from the ground surface, recorded in **meters below ground level (mbgl)**.

> [!NOTE]
> **Demonstration Data Notice**:
> The initial dataset included in `data/raw/cgwb_dwlr_sample.csv` is a synthetic demonstration dataset generated using realistic hydrological parameters (monsoonal seasonal recharge cycles, secular depletion trends, and observation noise) for multi-station monitoring across Punjab, Rajasthan, Haryana, Uttar Pradesh, and Tamil Nadu.
> 
> The system is fully equipped to ingest, validate, preprocess, and model actual official CGWB / DWLR CSV observation files uploaded via the application dashboard.

---

## 2. Dataset Attributes & Schema Definition

| Column Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `Date` | Date (`YYYY-MM-DD`) | Date of water level measurement | `2024-05-01` |
| `State` | String | Administrative State | `Punjab` |
| `District` | String | Administrative District | `Amritsar` |
| `Station` | String | Unique DWLR / Monitoring Station Name | `Amritsar Central` |
| `Latitude` | Float | Geographic latitude coordinate | `31.6340` |
| `Longitude` | Float | Geographic longitude coordinate | `74.8723` |
| `Water_Level` | Float | Groundwater level depth in meters below ground level | `26.85` |
| `Unit` | String | Measurement unit (standardized to `mbgl`) | `mbgl` |

---

## 3. Hydrological Interpretation of Water Level (mbgl)

- **Lower `mbgl` values (e.g. 5–12 mbgl)**: Shallow water table, indicating healthy groundwater storage or recent monsoon recharge.
- **Higher `mbgl` values (e.g. 25–45 mbgl)**: Deep water table, indicating significant aquifer depletion, heavy agricultural extraction, or drought conditions.
- **Seasonal Cyclicity**:
  - **Pre-Monsoon (March – June)**: Water table drops (highest `mbgl` values) due to summer heat and heavy tube-well pumping.
  - **Post-Monsoon (September – November)**: Water table rises / recharges (lowest `mbgl` values) due to monsoon precipitation infiltration.

---

## 4. Data Preprocessing Pipeline

1. **Schema Validation**: Ensures required headers (`Date`, `Station`, `Water_Level`) are present.
2. **Missing Value Imputation**: Forward fill (`ffill`) followed by linear interpolation for continuous time-series gaps.
3. **Outlier Filtering**: Removes non-physical negative depths or extreme values exceeding 150 mbgl.
4. **Time Regularization**: Resamples observations to a uniform monthly or weekly frequency per station.
5. **Feature Engineering**: Constructs lag features (`lag_1`, `lag_2`, `lag_3`, `lag_7`, `lag_14`, `lag_30`), rolling statistics (rolling mean, rolling standard deviation), and month/quarter calendar encodings.
