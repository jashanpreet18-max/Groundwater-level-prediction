# Methodology Report — Groundwater Level Prediction System

## 1. Executive Summary & Problem Formulation
Groundwater depletion is a critical environmental challenge impacting agricultural productivity, domestic water security, and ecosystem stability across arid and semi-arid regions. Time-series forecasting of groundwater table depth (measured in **meters below ground level / mbgl**) provides actionable intelligence for water resources management, artificial recharge planning, and drought mitigation.

This project delivers an end-to-end web platform and automated time-series machine learning pipeline that ingests historical observations, cleans continuous multi-year series, constructs lag features, trains baseline and ensemble regressors, evaluates performance chronologically, and projects future groundwater levels with 95% confidence bounds.

---

## 2. Dataset Architecture & Preprocessing
The system adheres to observation standards established by the **Central Ground Water Board (CGWB)** and **Digital Water Level Recorder (DWLR)** networks in India.

### 2.1 Dataset Schema
Each observation record contains:
- `Date`: Timestamp formatted as `YYYY-MM-DD`.
- `State` & `District`: Administrative region.
- `Station`: Unique DWLR observation station identifier.
- `Latitude` & `Longitude`: Geographic coordinates (WGS84).
- `Water_Level`: Depth to water table in **mbgl** (higher values represent deeper water table/depletion).
- `Unit`: Standardized unit (`mbgl`).

### 2.2 Quality Assurance & Imputation Pipeline
1. **Validation**: Enforces column structure and non-empty record limits ($N \ge 5$).
2. **Filtering**: Removes physical non-sequiturs ($\text{mbgl} < 0$ or $\text{mbgl} > 200$).
3. **Imputation**: Missing continuous observation gaps are filled using forward-fill ($\text{ffill}$) followed by linear interpolation:
   $$y_t = y_{t_1} + \frac{y_{t_2} - y_{t_1}}{t_2 - t_1} (t - t_1)$$
4. **Resampling**: Aggregates duplicate date records per station using arithmetic mean while preserving metadata attributes.

---

## 3. Feature Engineering
Time-series forecasting models require temporal context to capture seasonal monsoon recharge cycles and multi-year depletion trends.

### 3.1 Lag Features
For target variable $y_t$, lag features are constructed for horizons $k \in \{1, 2, 3, 7, 14, 30\}$:
$$\text{Lag}_k(t) = y_{t-k}$$

### 3.2 Rolling Statistics
Short-term memory windows capture local noise and variance:
$$\text{Rolling Mean}_w(t) = \frac{1}{w} \sum_{i=1}^{w} y_{t-i}$$
$$\text{Rolling Std}_w(t) = \sqrt{\frac{1}{w-1} \sum_{i=1}^{w} (y_{t-i} - \bar{y})^2}$$

### 3.3 Cyclical Calendar Features
Monsoonal precipitation patterns are encoded using trigonometric cyclical transformations:
$$\sin(m) = \sin\left(\frac{2\pi \cdot \text{Month}}{12}\right), \quad \cos(m) = \cos\left(\frac{2\pi \cdot \text{Month}}{12}\right)$$

---

## 4. Forecasting Model Formulations

### 4.1 Model 1: Naive Baseline
Predicts future values equal to the last historical observation or seasonal repetition (12 steps prior):
$$\hat{y}_{t+h} = y_t$$

### 4.2 Model 2: ARIMA / Holt-Winters Exponential Smoothing
Auto-Regressive Integrated Moving Average $\text{ARIMA}(p, d, q)$:
$$y_t' = c + \phi_1 y_{t-1}' + \dots + \phi_p y_{t-p}' + \theta_1 \epsilon_{t-1} + \dots + \theta_q \epsilon_{t-q} + \epsilon_t$$

### 4.3 Model 3 & 4: Ensemble Machine Learning (Random Forest & Gradient Boosting)
Random Forest Regressor aggregates $B$ decision trees trained on bootstrap samples:
$$\hat{f}_{\text{RF}}(x) = \frac{1}{B} \sum_{b=1}^{B} T_b(x)$$
Gradient Boosting sequentially fits residual error gradients:
$$f_m(x) = f_{m-1}(x) + \gamma_m h_m(x)$$

Multi-step recursive forecasting propagates predicted values iteratively into subsequent lag feature vectors.

---

## 5. Model Evaluation Metrics & Validation Strategy

To prevent **future-data leakage**, the time-series dataset is split chronologically into **80% Training Data** and **20% Out-of-Sample Test Data**.

### 5.1 Metric Formulations
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}$$
- **Coefficient of Determination ($R^2$)**:
  $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
- **Mean Absolute Percentage Error (MAPE)**:
  $$\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^{n} \left| \frac{y_i - \hat{y}_i}{y_i} \right|$$

---

## 6. Prediction Uncertainty & Confidence Intervals
95% prediction intervals are estimated based on in-sample residual standard error $\sigma_e$:
$$\text{CI}_{95\%} = \hat{y}_{t+h} \pm 1.96 \cdot \sigma_e \sqrt{1 + h \cdot \delta}$$
where $\delta$ is the variance growth coefficient over horizon $h$.

---

## 7. Limitations & Scientific Disclaimer
Groundwater forecasts represent statistical estimates based on historical measurements. Predictions should support, not replace, field-level hydrological assessment, pumping test audits, and official government water-resource management decisions.
