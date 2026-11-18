# Dataset Specifications & CGWB / DWLR Standards

## 1. Data Source Context
Groundwater observations in India are officially monitored by the **Central Ground Water Board (CGWB)** under the Ministry of Jal Shakti, and recorded automatically via **Digital Water Level Recorder (DWLR)** telemetry networks.

Water table measurements express the vertical distance from the land surface to the free water surface in the unconfined or semi-confined aquifer, measured in **meters below ground level (mbgl)**.

---

## 2. Flexible Schema Mapping
The system includes an intelligent column aliases mapper (`backend/preprocessing/validator.py`) that normalizes variant column headers from external government portals or user CSV uploads:

| Standard Attribute | Target Data Type | Accepted Input Aliases |
| :--- | :--- | :--- |
| `Date` | Datetime (`YYYY-MM-DD`) | `date`, `observation_date`, `datetime`, `time` |
| `Station` | String | `station`, `station_name`, `location`, `dwlr_id` |
| `Water_Level` | Float (mbgl) | `water_level`, `groundwater_level`, `water_table`, `mbgl`, `value` |
| `State` | String | `state`, `province` |
| `District` | String | `district`, `county` |
| `Latitude` | Float | `latitude`, `lat` |
| `Longitude` | Float | `longitude`, `lon`, `long` |
| `Unit` | String | `unit`, `measurement_unit` |

---

## 3. Hydrological Status Classification
Groundwater status is categorized into 4 operational management bands (configurable relative or absolute bounds):

- **NORMAL (< 15.0 mbgl)**: Shallow water table, safe historical operating range, adequate aquifer storage.
- **WATCH (15.0 – 25.0 mbgl)**: Moderate drawdown, seasonal monitoring recommended.
- **LOW (25.0 – 35.0 mbgl)**: Deep water table, significant agricultural extraction, conservation measures advised.
- **CRITICAL (> 35.0 mbgl)**: Severely depleted aquifer, critical water scarcity risk, artificial recharge required.

---

## 4. Demonstration Data Notice
> [!IMPORTANT]
> The initial multi-station dataset included in `data/raw/cgwb_dwlr_sample.csv` is a synthetic demonstration dataset generated via reproducible script (`data/demo/generate_demo_data.py`) with fixed random seed `42`.
> 
> The application clearly displays a **Demo Data** notice and provides a live CSV upload interface for ingesting official CGWB/DWLR observation files.
