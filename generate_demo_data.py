import os
import math
import pandas as pd
import numpy as np

def generate_demo_dataset(output_path: str = "c:/code/groundwater-level-prediction/data/raw/cgwb_dwlr_sample.csv"):
    """
    Generates a reproducible demonstration dataset adhering to Central Ground Water Board (CGWB)
    and Digital Water Level Recorder (DWLR) standards for multi-station monitoring.
    
    Includes multi-year monthly observations (2018-2025) with monsoonal seasonal recharge cycles,
    secular depletion trends, and observation noise across 7 stations.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    stations = [
        {'state': 'Punjab', 'district': 'Amritsar', 'station': 'Amritsar Central', 'lat': 31.6340, 'lon': 74.8723, 'base': 24.5, 'trend': 0.4, 'seasonal': 2.8, 'noise': 0.3},
        {'state': 'Punjab', 'district': 'Jalandhar', 'station': 'Jalandhar North', 'lat': 31.3260, 'lon': 75.5762, 'base': 21.0, 'trend': 0.35, 'seasonal': 2.5, 'noise': 0.25},
        {'state': 'Rajasthan', 'district': 'Jaipur', 'station': 'Jaipur West (Sanganer)', 'lat': 26.8143, 'lon': 75.8003, 'base': 35.2, 'trend': 0.6, 'seasonal': 3.5, 'noise': 0.4},
        {'state': 'Rajasthan', 'district': 'Jodhpur', 'station': 'Jodhpur Rural', 'lat': 26.2389, 'lon': 73.0243, 'base': 42.8, 'trend': 0.7, 'seasonal': 4.0, 'noise': 0.5},
        {'state': 'Haryana', 'district': 'Karnal', 'station': 'Karnal Agricultural Zone', 'lat': 29.6857, 'lon': 76.9905, 'base': 18.4, 'trend': 0.25, 'seasonal': 2.2, 'noise': 0.2},
        {'state': 'Uttar Pradesh', 'district': 'Lucknow', 'station': 'Lucknow Gomti Basin', 'lat': 26.8467, 'lon': 80.9462, 'base': 12.6, 'trend': 0.15, 'seasonal': 1.8, 'noise': 0.2},
        {'state': 'Tamil Nadu', 'district': 'Coimbatore', 'station': 'Coimbatore South', 'lat': 11.0168, 'lon': 76.9558, 'base': 15.8, 'trend': 0.2, 'seasonal': 2.1, 'noise': 0.3}
    ]

    dates = pd.date_range(start='2018-01-01', end='2025-12-01', freq='MS')
    np.random.seed(42)

    records = []
    for st in stations:
        for i, date in enumerate(dates):
            t_years = i / 12.0
            month = date.month
            seasonal_effect = math.sin((month - 2) * (2 * math.pi / 12)) * st['seasonal']
            trend_effect = t_years * st['trend']
            noise_effect = np.random.normal(0, st['noise'])
            
            water_level = round(st['base'] + trend_effect + seasonal_effect + noise_effect, 2)
            water_level = max(1.5, water_level)
            
            records.append({
                'Date': date.strftime('%Y-%m-%d'),
                'State': st['state'],
                'District': st['district'],
                'Station': st['station'],
                'Latitude': st['lat'],
                'Longitude': st['lon'],
                'Water_Level': water_level,
                'Unit': 'mbgl'
            })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated demo dataset with {len(df)} records across {len(stations)} stations at: {output_path}")
    return df

if __name__ == "__main__":
    generate_demo_dataset()
