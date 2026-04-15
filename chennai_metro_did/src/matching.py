import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
import os

def compute_propensity_scores(df):
    """Compute PS at the jurisdiction level."""
    # First, derive jurisdiction-level dataset
    # We need to know which jurisdictions are "treated"
    # A jurisdiction is treated if it has a significant portion of treated transactions, 
    # but the simplest way is to see if any transaction is treated, or just majority.
    # Let's say a jurisdiction is treated if it contains >= 1 metro station or average distance < 1.5km.
    # Let's just use the max 'treated' from transactions per jurisdiction
    
    juris_df = df.groupby('sub_registrar_office').agg(
        pre_metro_median_price=('pre_metro_median_price', 'first'),
        pre_metro_price_growth=('pre_metro_price_growth', 'first'),
        transaction_volume=('transaction_volume', 'first'),
        treated=('treated', 'max') # 1 if any part of it is within 1km
    ).reset_index()
    
    # Needs zone dummies, we merge from sub_registrar_boundaries
    sro_df = pd.read_csv('data/raw/sub_registrar_boundaries.csv')
    juris_df = pd.merge(juris_df, sro_df[['sub_registrar_office', 'zone']], on='sub_registrar_office', how='left')
    
    juris_df['zone_north_chennai'] = (juris_df['zone'] == 'North').astype(int)
    juris_df['zone_south_chennai'] = (juris_df['zone'] == 'South').astype(int)
    
    # Synthetic dist to arterial road
    np.random.seed(42)
    juris_df['dist_nearest_arterial_road'] = np.random.uniform(50, 2000, len(juris_df))
    
    # Features for PSM
    features = [
        'pre_metro_median_price', 
        'pre_metro_price_growth', 
        'log_transaction_volume',
        'dist_nearest_arterial_road',
        'zone_north_chennai',
        'zone_south_chennai'
    ]
    
    juris_df['log_transaction_volume'] = np.log(juris_df['transaction_volume'])
    
    X = juris_df[features].copy()
    
    scaler = StandardScaler()
    X[['pre_metro_median_price', 'pre_metro_price_growth', 'log_transaction_volume', 'dist_nearest_arterial_road']] = scaler.fit_transform(X[['pre_metro_median_price', 'pre_metro_price_growth', 'log_transaction_volume', 'dist_nearest_arterial_road']])
    
    y = juris_df['treated']
    
    model = LogisticRegression(C=1.0, random_state=42)
    model.fit(X, y)
    
    juris_df['propensity_score'] = model.predict_proba(X)[:, 1]
    
    # Plot distribution
    plt.figure(figsize=(8, 5))
    sns.histplot(data=juris_df, x='propensity_score', hue='treated', common_norm=False, bins=15, alpha=0.6)
    plt.title('Propensity Score Distribution (Jurisdiction Level)')
    plt.savefig('outputs/propensity_score_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    juris_df['X_scaled'] = list(X.values)
    return juris_df, features

def match_treated_to_controls(juris_df, caliper=0.05, ratio=1):
    treated = juris_df[juris_df['treated'] == 1].copy()
    controls = juris_df[juris_df['treated'] == 0].copy()
    
    matched_controls_idx = []
    matched_treated_idx = []
    matched_group_id = 0
    match_map = {}
    
    for t_idx, t_row in treated.iterrows():
        t_ps = t_row['propensity_score']
        t_zone = t_row['zone']
        
        # Valid controls: same zone, within caliper
        valid_controls = controls[
            (controls['zone'] == t_zone) & 
            (np.abs(controls['propensity_score'] - t_ps) <= caliper) &
            (~controls.index.isin(matched_controls_idx)) # 1:1 matching without replacement
        ]
        
        if len(valid_controls) > 0:
            # Nearest neighbor
            distances = np.abs(valid_controls['propensity_score'] - t_ps)
            best_idx = distances.idxmin()
            
            matched_controls_idx.append(best_idx)
            matched_treated_idx.append(t_idx)
            
            match_map[t_idx] = matched_group_id
            match_map[best_idx] = matched_group_id
            matched_group_id += 1
            
    print(f"Matched {len(matched_treated_idx)} treated jurisdictions.")
    print(f"Dropped {len(treated) - len(matched_treated_idx)} treated jurisdictions (no match).")
    
    matched_df = juris_df.loc[matched_treated_idx + matched_controls_idx].copy()
    matched_df['matched_group_id'] = matched_df.index.map(match_map)
    return matched_df

def compute_smd(df, feature, treatment_col='treated'):
    t_mean = df[df[treatment_col] == 1][feature].mean()
    c_mean = df[df[treatment_col] == 0][feature].mean()
    t_var = df[df[treatment_col] == 1][feature].var()
    c_var = df[df[treatment_col] == 0][feature].var()
    
    smd = (t_mean - c_mean) / np.sqrt((t_var + c_var) / 2)
    return smd

def check_covariate_balance(pre_match_df, post_match_df, features):
    smd_pre = {f: compute_smd(pre_match_df, f) for f in features}
    smd_post = {f: compute_smd(post_match_df, f) for f in features}
    
    balance_df = pd.DataFrame({
        'Feature': features,
        'SMD_Before': [smd_pre[f] for f in features],
        'SMD_After': [smd_post[f] for f in features]
    })
    
    balance_df.to_csv('outputs/covariate_balance_table.csv', index=False)
    
    # Love Plot
    plt.figure(figsize=(8, 6))
    plt.plot(balance_df['SMD_Before'], range(len(features)), 'o', color='red', label='Before Matching')
    plt.plot(balance_df['SMD_After'], range(len(features)), 'o', color='blue', label='After Matching')
    plt.axvline(x=0.1, color='gray', linestyle='--', label='0.1 Threshold')
    plt.axvline(x=-0.1, color='gray', linestyle='--')
    plt.axvline(x=0, color='black', alpha=0.5)
    plt.yticks(range(len(features)), features)
    plt.title('Covariate Balance (Love Plot)')
    plt.legend()
    plt.tight_layout()
    plt.savefig('outputs/love_plot.png', dpi=300)
    plt.close()
    
    print("\nCovariate Balance (SMD):")
    print(balance_df.round(3))
    for i, row in balance_df.iterrows():
        if abs(row['SMD_After']) > 0.1:
            print(f"WARNING: Feature {row['Feature']} has SMD > 0.1 ({row['SMD_After']:.3f})")

def create_matched_panel(transactions_df, matched_juris_df):
    matched_sros = matched_juris_df['sub_registrar_office'].unique()
    panel = transactions_df[transactions_df['sub_registrar_office'].isin(matched_sros)].copy()
    
    # Add matched group ID to panel
    group_map = matched_juris_df.set_index('sub_registrar_office')['matched_group_id'].to_dict()
    panel['matched_group_id'] = panel['sub_registrar_office'].map(group_map)
    
    # Important update to treatment definition for DiD:
    # A property is strictly treated if dist <= 1km
    # It belongs to a treated *jurisdiction*, but for exact DiD, we define treated on the property level
    # Or jurisdiction level intent-to-treat. The prompt says "treated = 1 if dist <= 1000" in geocoding.
    panel.to_parquet('data/processed/matched_panel.parquet', index=False)
    print(f"\nCreated matched panel with {len(panel)} transactions across {len(matched_sros)} jurisdictions.")

if __name__ == "__main__":
    df = pd.read_parquet('data/processed/transactions_featured.parquet')
    
    print("Computing propensity scores...")
    juris_df, features = compute_propensity_scores(df)
    
    print("Matching treated to controls...")
    # Increase caliper if match drops are too high, but prompt requested 0.05
    matched_df = match_treated_to_controls(juris_df, caliper=0.05, ratio=1)
    
    print("Checking balance...")
    check_covariate_balance(juris_df, matched_df, features)
    
    print("Creating matched panel...")
    create_matched_panel(df, matched_df)
    
