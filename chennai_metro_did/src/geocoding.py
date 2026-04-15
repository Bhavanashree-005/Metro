import pandas as pd
import numpy as np

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    return R * c

def compute_distance_to_stations(transactions_df, stations_df):
    print("Computing distances to all stations...")
    lats = transactions_df['lat'].values
    lons = transactions_df['lon'].values
    stn_lats = stations_df['latitude'].values
    stn_lons = stations_df['longitude'].values
    stn_ids = stations_df['station_id'].values
    stn_names = stations_df['station_name'].values
    stn_lines = stations_df['line'].values
    stn_types = stations_df['station_type'].values
    
    n_txn = len(transactions_df)
    min_dists = np.full(n_txn, 999999.0)
    best_stn_id = np.empty(n_txn, dtype=object)
    best_stn_name = np.empty(n_txn, dtype=object)
    best_line = np.empty(n_txn, dtype=object)
    best_type = np.empty(n_txn, dtype=object)
    
    for i in range(len(stations_df)):
        dists = haversine(lats, lons, stn_lats[i], stn_lons[i])
        mask = dists < min_dists
        min_dists[mask] = dists[mask]
        best_stn_id[mask] = stn_ids[i]
        best_stn_name[mask] = stn_names[i]
        best_line[mask] = stn_lines[i]
        best_type[mask] = stn_types[i]
        
    transactions_df['dist_nearest_station_m'] = min_dists
    transactions_df['nearest_station_id'] = best_stn_id
    transactions_df['nearest_station_name'] = best_stn_name
    transactions_df['nearest_line'] = best_line
    transactions_df['nearest_station_type'] = best_type
    
    def get_band(d):
        if d <= 250: return '0_250m'
        if d <= 500: return '250_500m'
        if d <= 1000: return '500m_1km'
        return 'over_1km'
        
    transactions_df['dist_band'] = transactions_df['dist_nearest_station_m'].apply(get_band)
    transactions_df['treated'] = (transactions_df['dist_nearest_station_m'] <= 1000).astype(int)
    
    return transactions_df

def assign_treatment_timing(transactions_df, stations_df):
    stn_dates = stations_df.set_index('station_id')['opening_date'].to_dict()
    # Handle pd.Timestamp types directly if needed, assuming the dates are parsed.
    # Convert 'transaction_date' and 'opening_date' to datetime
    transactions_df['transaction_date'] = pd.to_datetime(transactions_df['transaction_date'])
    
    opening_dates = transactions_df['nearest_station_id'].map(stn_dates)
    transactions_df['station_opening_date'] = pd.to_datetime(opening_dates)
    
    transactions_df['post'] = (transactions_df['transaction_date'] >= transactions_df['station_opening_date']).astype(int)
    
    transactions_df['years_to_opening'] = (transactions_df['transaction_date'] - transactions_df['station_opening_date']).dt.days / 365.25
    
    # event_time = round(years_to_opening) capped at [-5, +8]
    event_time = transactions_df['years_to_opening'].round()
    transactions_df['event_time'] = event_time.clip(lower=-5, upper=8)
    
    # construction_period = 1 if year in [2009, 2010... 2014]
    transactions_df['year'] = transactions_df['transaction_date'].dt.year
    transactions_df['construction_period'] = transactions_df['year'].isin(range(2009, 2015)).astype(int)
    
    return transactions_df

def build_control_features(transactions_df):
    pre_metro = transactions_df[transactions_df['year'] < 2015]
    
    agg = pre_metro.groupby('sub_registrar_office').agg(
        pre_metro_median_price=('declared_price_sqft', 'median'),
        transaction_volume=('transaction_id', 'count')
    ).reset_index()
    
    # For price growth 2009-2014
    yr_prices = pre_metro.groupby(['sub_registrar_office', 'year'])['declared_price_sqft'].median().reset_index()
    p_2009 = yr_prices[yr_prices['year'] == 2009].set_index('sub_registrar_office')['declared_price_sqft']
    p_2014 = yr_prices[yr_prices['year'] == 2014].set_index('sub_registrar_office')['declared_price_sqft']
    
    # If 2009 isn't present for a jurisdiction, fallback. Using mean for missing values in case of synthetic data sparsity
    growth = ((p_2014 / p_2009) ** (1/5)) - 1
    growth = growth.fillna(0.08) # fallback 8%
    
    agg['pre_metro_price_growth'] = agg['sub_registrar_office'].map(growth).fillna(0.08)
    
    # Merge back to transactions
    transactions_df = pd.merge(transactions_df, agg, on='sub_registrar_office', how='left')
    
    return transactions_df

def add_log_price(transactions_df):
    # Winsorization (1st and 99th percentile)
    p01 = transactions_df['declared_price_sqft'].quantile(0.01)
    p99 = transactions_df['declared_price_sqft'].quantile(0.99)
    transactions_df['winsorized_price_sqft'] = transactions_df['declared_price_sqft'].clip(lower=p01, upper=p99)
    
    transactions_df['log_price_sqft'] = np.log(transactions_df['winsorized_price_sqft'])
    # Add log_area_sqft for did model
    transactions_df['log_area_sqft'] = np.log(transactions_df['area_sqft'])
    return transactions_df

def compute_guideline_correction_ratio(transactions_df):
    # Guideline value = 65% of median declared per jurisdiction-year
    jurisdiction_year_median = transactions_df.groupby(['sub_registrar_office', 'year'])['declared_price_sqft'].transform('median')
    guideline_value = jurisdiction_year_median * 0.65
    
    transactions_df['correction_ratio'] = guideline_value / transactions_df['declared_price_sqft']
    transactions_df['corrected_price_sqft'] = transactions_df['declared_price_sqft'] / transactions_df['correction_ratio']
    
    return transactions_df

if __name__ == "__main__":
    print("Loading raw data...")
    tx_df = pd.read_csv('data/raw/property_transactions.csv')
    stn_df = pd.read_csv('data/raw/metro_stations.csv')
    
    print("Computing distances...")
    tx_df = compute_distance_to_stations(tx_df, stn_df)
    
    print("Assigning treatment timing...")
    tx_df = assign_treatment_timing(tx_df, stn_df)
    
    print("Building control features...")
    tx_df = build_control_features(tx_df)
    
    print("Adding log prices...")
    tx_df = add_log_price(tx_df)
    
    print("Computing guideline correction...")
    tx_df = compute_guideline_correction_ratio(tx_df)
    
    print("Saving processed data...")
    # Add required column by later steps: year_quarter
    tx_df['year_quarter'] = tx_df['transaction_date'].dt.to_period('Q').astype(str)
    tx_df.to_parquet('data/processed/transactions_featured.parquet', index=False)
    
    print("\n--- Feature Engineering Summary ---")
    print(f"Total Transactions: {len(tx_df)}")
    print(f"% Treated (<=1km): {(tx_df['treated'].mean() * 100):.1f}%")
    print(f"% Post-Treatment: {(tx_df['post'].mean() * 100):.1f}%")
    print("\nDistance Band Distribution:")
    print(tx_df['dist_band'].value_counts(normalize=True).round(3) * 100)
    print("\nTimeline Coverage:")
    print(tx_df['year'].value_counts().sort_index())
    print("\nGeocoding and Feature Engineering complete.")
    
