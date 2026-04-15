import pandas as pd
import numpy as np
from pathlib import Path
import os
from ml.synthetic import generate_synthetic_data

# Global storage
class DataProvider:
    def __init__(self):
        self.df = pd.DataFrame()
        self.metro_df = pd.DataFrame()
        self.initialize()

    def initialize(self):
        # Try to load existing data (prioritize user-provided trials) or generate synthetic
        # Dynamic path resolution for both local and cloud (Vercel) environments
        root_dir = Path(__file__).parent.parent.parent.parent
        raw_path = root_dir / "chennai_property_trials.csv"
        legacy_path = root_dir / "chennai_metro_did" / "data" / "raw" / "property_transactions.csv"
        metro_path = root_dir / "chennai_metro_did" / "data" / "raw" / "metro_stations.csv"
        
        target_path = raw_path if raw_path.exists() else legacy_path
        
        if target_path.exists() and metro_path.exists():
            try:
                self.df = pd.read_csv(target_path)
                self.metro_df = pd.read_csv(metro_path)
                # Apply basic preprocessing if missing
                if 'price_sqft' not in self.df.columns:
                    self.preprocess_df()
                return
            except Exception as e:
                print(f"Error loading local data: {e}")

        # Fallback to synthetic
        print("Generating synthetic data fallback...")
        self.df, self.metro_df = generate_synthetic_data(15000)
        self.preprocess_df()

    def preprocess_df(self):
        # Ensure standard columns exist
        if 'price_sqft' not in self.df.columns:
            if 'declared_value' in self.df.columns:
                self.df['price_sqft'] = self.df['declared_value'] / self.df['area_sqft']
            elif 'price_per_sqft' in self.df.columns:
                self.df['price_sqft'] = self.df['price_per_sqft']
        
        # Simple treatment logic for synthetic/raw if missing
        if 'treated' not in self.df.columns:
            if 'distance_to_metro_m' in self.df.columns:
                self.df['treated'] = (self.df['distance_to_metro_m'] <= 1000).astype(int)
            else:
                self.df['treated'] = 0
        
        if 'post' not in self.df.columns:
            # Assume 2015 is the cutoff for Phase 1 in synthetic
            self.df['post'] = (self.df['year'] >= 2015).astype(int)

        # Derive distance_band if not present
        if 'distance_band' not in self.df.columns and 'distance_to_metro_m' in self.df.columns:
            bins   = [0, 500, 1000, 1500, 2000, 5001]
            labels = ['<500m', '500m-1km', '1-1.5km', '1.5-2km', '>2km']
            self.df['distance_band'] = pd.cut(
                self.df['distance_to_metro_m'], bins=bins, labels=labels, right=False
            ).astype(str)

        # Derive property_type fallback
        if 'property_type' not in self.df.columns:
            self.df['property_type'] = 'Apartment'

# Singleton instance
data_provider = DataProvider()

def get_data():
    return data_provider.df, data_provider.metro_df

def reload_data(new_df=None, new_metro_df=None):
    if new_df is not None:
        data_provider.df = new_df
    if new_metro_df is not None:
        data_provider.metro_df = new_metro_df
    return data_provider.df, data_provider.metro_df

# For legacy imports
df = data_provider.df
metro_df = data_provider.metro_df
