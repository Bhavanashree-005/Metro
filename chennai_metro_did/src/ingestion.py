import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
import os
import math

# Set random seed for reproducibility
np.random.seed(42)

def generate_sub_registrar_offices():
    """Generate 45 Sub-Registrar Offices with locations and zones."""
    offices = []
    zones = ['North', 'Central', 'South']
    # Approximate bounding box for Chennai: Lat 12.85 to 13.15, Lon 80.15 to 80.30
    
    for i in range(1, 46):
        zone = np.random.choice(zones, p=[0.3, 0.3, 0.4])
        # Assign coordinates based on zone
        if zone == 'North':
            lat = np.random.uniform(13.10, 13.15)
            lon = np.random.uniform(80.20, 80.30)
            base_price = np.random.uniform(2000, 3000)
        elif zone == 'Central':
            lat = np.random.uniform(13.00, 13.10)
            lon = np.random.uniform(80.20, 80.28)
            base_price = np.random.uniform(4000, 7000)
        else: # South
            lat = np.random.uniform(12.85, 13.00)
            lon = np.random.uniform(80.15, 80.25)
            base_price = np.random.uniform(3500, 6000)
            
        offices.append({
            'sub_registrar_office': f'SRO_{i:02d}',
            'zone': zone,
            'sro_lat': lat,
            'sro_lon': lon,
            'base_price_2009': base_price
        })
        
    return pd.DataFrame(offices)

def generate_metro_stations():
    """Generate 32 Phase 1 Metro Stations."""
    stations = []
    lines = ['Blue', 'Green']
    station_types = ['Interchange', 'Terminal', 'Intermediate']
    
    # Phase 1 opening dates range from 2015 to 2019
    opening_dates = [
        pd.to_datetime('2015-06-29'), # Koyambedu to Alandur
        pd.to_datetime('2016-09-21'), # Little Mount to Airport
        pd.to_datetime('2017-05-14'), # Thirumangalam to Nehru Park
        pd.to_datetime('2018-05-25'), # Nehru Park to Central
        pd.to_datetime('2019-02-10')  # AG-DMS to Washermanpet
    ]
    
    for i in range(1, 33):
        line = np.random.choice(lines)
        if i == 1:
            stype = 'Terminal'
        elif i == 16:
            stype = 'Interchange'
        else:
            stype = np.random.choice(['Intermediate', 'Terminal'], p=[0.9, 0.1])
            
        stations.append({
            'station_id': f'STN_{i:02d}',
            'station_name': f'Station_{i:02d}_{line}',
            'line': line,
            'station_type': stype,
            'latitude': np.random.uniform(12.95, 13.12),
            'longitude': np.random.uniform(80.18, 80.28),
            'opening_date': np.random.choice(opening_dates)
        })
        
    return pd.DataFrame(stations)

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in meters between two points on the earth."""
    R = 6371000 # Radius of earth in meters
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    return R * c

def generate_transactions(n_records, sro_df, stations_df):
    """Generate property transactions."""
    dates = pd.date_range(start='2009-01-01', end='2024-12-31', freq='D')
    
    df = pd.DataFrame({
        'transaction_date': np.random.choice(dates, n_records)
    })
    
    df['year'] = df['transaction_date'].dt.year
    df['month'] = df['transaction_date'].dt.month
    df['day'] = df['transaction_date'].dt.day
    df['transaction_id'] = [f"TXN_{d.strftime('%Y%m%d')}_{np.random.randint(10000, 99999)}" 
                            for d in df['transaction_date']]
    
    # Assign SRO
    sro_sample = sro_df.sample(n=n_records, replace=True).reset_index(drop=True)
    df['sub_registrar_office'] = sro_sample['sub_registrar_office']
    df['base_price_2009'] = sro_sample['base_price_2009']
    
    # Generate coordinates for properties around their SRO (+/- 0.02 degrees)
    df['lat'] = sro_sample['sro_lat'] + np.random.uniform(-0.02, 0.02, n_records)
    df['lon'] = sro_sample['sro_lon'] + np.random.uniform(-0.02, 0.02, n_records)
    
    # Property Types & Areas
    ptypes = ['residential_apartment', 'residential_house', 'plot']
    df['property_type'] = np.random.choice(ptypes, p=[0.7, 0.2, 0.1], size=n_records)
    
    areas = []
    for ptype in df['property_type']:
        if ptype == 'residential_apartment':
            a = np.random.normal(900, 250)
        elif ptype == 'residential_house':
            a = np.random.normal(1400, 400)
        else: # plot
            a = np.random.normal(2000, 800)
        areas.append(max(300, int(a))) # Ensure positive area
    df['area_sqft'] = areas
    
    # Price Generation
    # 1. Base price varies by zone (already assigned via SRO)
    # 2. Annual Chennai-wide appreciation: 8%
    years_elapsed = df['year'] - 2009 + (df['month'] - 1) / 12.0
    appreciation_factor = (1.08) ** years_elapsed
    
    true_price_sqft = df['base_price_2009'] * appreciation_factor
    
    # Needs nearest station to compute locational premiums and treatment
    # Vectorized distance to nearest station is heavy, let's approximate by looping over chunks or just computing it.
    # Since n_records is 150k and stations is 32, we can do 150k x 32 distance calc.
    print("Calculating distances to metro stations for true price generation...")
    lats = df['lat'].values
    lons = df['lon'].values
    stn_lats = stations_df['latitude'].values
    stn_lons = stations_df['longitude'].values
    stn_dates = stations_df['opening_date'].values
    
    min_dists = np.full(n_records, 999999.0)
    nearest_stn_dates = np.empty(n_records, dtype='datetime64[ns]')
    
    for i in range(len(stations_df)):
        dists = haversine(lats, lons, stn_lats[i], stn_lons[i])
        mask = dists < min_dists
        min_dists[mask] = dists[mask]
        nearest_stn_dates[mask] = stn_dates[i]
        
    df['dist_nearest_station_m'] = min_dists
    df['nearest_station_opening_date'] = nearest_stn_dates
    
    # 3. Pre-metro locational premium for metro-corridor areas: +15% base (selection bias)
    corridor_mask = df['dist_nearest_station_m'] <= 1500
    true_price_sqft = np.where(corridor_mask, true_price_sqft * 1.15, true_price_sqft)
    
    # 4. CAUSAL metro treatment effect (added AFTER station opening date)
    post_treatment = df['transaction_date'] >= df['nearest_station_opening_date']
    
    treatment_effect = np.ones(n_records)
    d = df['dist_nearest_station_m']
    
    mask_250 = post_treatment & (d <= 250)
    mask_500 = post_treatment & (d > 250) & (d <= 500)
    mask_1000 = post_treatment & (d > 500) & (d <= 1000)
    
    treatment_effect[mask_250] = 1.18
    treatment_effect[mask_500] = 1.12
    treatment_effect[mask_1000] = 1.07
    
    true_price_sqft *= treatment_effect
    
    # 6. Add noise: N(0, 0.08) on log scale
    noise = np.random.normal(0, 0.08, n_records)
    true_price_sqft = np.exp(np.log(true_price_sqft) + noise)
    
    # 5. Under-declaration factor: random(0.55, 0.75)
    under_decl = np.random.uniform(0.55, 0.75, n_records)
    df['declared_price_sqft'] = true_price_sqft * under_decl
    
    df['declared_consideration'] = df['declared_price_sqft'] * df['area_sqft']
    
    # Drop intermediate columns
    columns_to_keep = [
        'transaction_id', 'transaction_date', 'sub_registrar_office', 
        'property_type', 'area_sqft', 'declared_consideration', 'declared_price_sqft',
        'lat', 'lon' # Keeping coordinates for geocoding step
    ]
    return df[columns_to_keep]

if __name__ == "__main__":
    print("Starting data ingestion and generation...")
    # Add requirements to a file so we can install them if needed
    os.makedirs('data/raw', exist_ok=True)
    
    print("Generating sub-registrar offices...")
    sro_df = generate_sub_registrar_offices()
    sro_df.to_csv('data/raw/sub_registrar_boundaries.csv', index=False)
    
    print("Generating metro stations...")
    stations_df = generate_metro_stations()
    stations_df.to_csv('data/raw/metro_stations.csv', index=False)
    
    print("Generating ~150,000 property transactions...")
    transactions_df = generate_transactions(150000, sro_df, stations_df)
    transactions_df.to_csv('data/raw/property_transactions.csv', index=False)
    
    print("\n--- Data Quality Report ---")
    print(f"Transactions rows: {len(transactions_df)}")
    print(f"Date range: {transactions_df['transaction_date'].min().date()} to {transactions_df['transaction_date'].max().date()}")
    print(f"Stations count: {len(stations_df)}")
    print(f"SRO count: {len(sro_df)}")
    print("\nProperty Type Distribution:")
    print(transactions_df['property_type'].value_counts(normalize=True).round(3))
    print("\nAverage Declared Price per SqFt:")
    print(transactions_df.groupby('property_type')['declared_price_sqft'].mean().round(2))
    print("\nData generation complete.")

