import pandas as pd
import numpy as np

def generate_synthetic_data(n_records=15000):
    """
    Generates realistic 15-year synthetic property transactions for Chennai
    calibrated to real-world Phase 1 benchmarks (~25-35% appreciation).
    """
    np.random.seed(42)
    
    # 1. Real Chennai Phase 1 Stations
    stations_data = [
        {'name': 'Guindy', 'line': 'Blue', 'lat': 13.0067, 'lng': 80.2206, 'open': 2016, 'base': 13500},
        {'name': 'Saidapet', 'line': 'Blue', 'lat': 13.0232, 'lng': 80.2215, 'open': 2018, 'base': 9500},
        {'name': 'Anna Nagar Tower', 'line': 'Green', 'lat': 13.0853, 'lng': 80.2120, 'open': 2017, 'base': 12000},
        {'name': 'Vadapalani', 'line': 'Green', 'lat': 13.0500, 'lng': 80.2121, 'open': 2015, 'base': 10500},
        {'name': 'Alandur', 'line': 'Blue/Green', 'lat': 13.0040, 'lng': 80.1990, 'open': 2015, 'base': 8500},
        {'name': 'Little Mount', 'line': 'Blue', 'lat': 13.0125, 'lng': 80.2241, 'open': 2016, 'base': 9000},
        {'name': 'Thirumangalam', 'line': 'Green', 'lat': 13.0851, 'lng': 80.1981, 'open': 2017, 'base': 8500},
        {'name': 'Koyambedu', 'line': 'Green', 'lat': 13.0733, 'lng': 80.1950, 'open': 2015, 'base': 7500},
    ]
    
    stations = []
    for s in stations_data:
        stations.append({
            'station_name': s['name'],
            'line': s['line'],
            'lat': s['lat'],
            'lng': s['lng'],
            'opening_year': s['open'],
            'base_anchor': s['base']
        })
    df_stn = pd.DataFrame(stations)
    
    # 2. Properties
    data = []
    types = ['Apartment', 'Independent House', 'Plot']
    
    for _ in range(n_records):
        stn = df_stn.sample(1).iloc[0]
        
        # Distance band
        dist_m = np.random.choice([
            np.random.uniform(50, 400),
            np.random.uniform(400, 800),
            np.random.uniform(800, 1500),
            np.random.uniform(1500, 3000)
        ])
        
        year = np.random.randint(2008, 2024)
        prop_type = np.random.choice(types)
        
        # Base price calculation grounded in research
        base_price = stn['base_anchor']
        
        # Time trend: 6% naturally per year in Chennai
        time_mult = (1.06) ** (year - 2008)
        
        # Real-world DiD Effect (25-35% appreciation observed)
        treated_status = 1 if dist_m <= 1000 else 0
        post_status = 1 if year >= stn['opening_year'] else 0
        
        premium_multiplier = 1.0
        if post_status == 1 and treated_status == 1:
            # Distance-decay effect
            if dist_m <= 500:
                premium_multiplier = 1.32 # +32% premium for hyper-local (Guindy range)
            else:
                premium_multiplier = 1.18 # +18% premium for 500m-1km
                
        # Confounders
        confounder_mult = 1.1 if (year >= 2019 and prop_type == 'Plot') else 1.0
        
        # Add random noise +/- 10% (Tighter for "real" feel)
        noise = np.random.uniform(0.9, 1.1)
        
        # Calculate actual market value price/sqft
        true_psqft = base_price * time_mult * premium_multiplier * confounder_mult * noise
        
        # Area and total value
        area = np.random.uniform(900, 2500)
        true_value = true_psqft * area
        
        data.append({
            'transaction_id': f"TXN_{np.random.randint(100000, 999999)}",
            'date': f"{np.random.randint(1,28):02d}-{np.random.randint(1,12):02d}-{year}",
            'year': year,
            'sub_registrar_office': f"SRO_{stn['station_name'][:3].upper()}",
            'area_sqft': round(area),
            'property_type': prop_type,
            'declared_value': round(true_value), # Removed under-declaration for cleaner "Real" analytics
            'distance_to_metro_m': round(dist_m),
            'station_name': stn['station_name'],
            'lat': stn['lat'] + np.random.uniform(-0.005, 0.005),
            'lng': stn['lng'] + np.random.uniform(-0.005, 0.005),
            'treated': treated_status,
            'post': post_status
        })
        
    df = pd.DataFrame(data)
    df['price_per_sqft'] = df['declared_value'] / df['area_sqft']
    
    return df, df_stn

if __name__ == "__main__":
    df, stn = generate_synthetic_data(1000)
    print("Synthetic generated:", len(df))
    print(df.head())
