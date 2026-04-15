import pandas as pd
import numpy as np
import statsmodels.formula.api as smf
import matplotlib.pyplot as plt
import seaborn as sns
import os

def parallel_trends_test(df):
    """Run parallel trends test using pre-treatment data only."""
    pre_df = df[(df['event_time'] >= -5) & (df['event_time'] <= -1)].copy()
    
    # We want to interact treated with event_time
    formula = "log_price_sqft ~ C(event_time)*treated + C(sub_registrar_office) + C(year_quarter)"
    
    model = smf.ols(formula, data=pre_df)
    results = model.fit(cov_type='cluster', cov_kwds={'groups': pre_df['sub_registrar_office']})
    
    # The interaction terms are like C(event_time)[T.-4.0]:treated
    interaction_terms = [col for col in results.params.index if 'treated' in col and 'event_time' in col]
    
    # F-test on joint significance
    hypothesis = " = 0, ".join(interaction_terms) + " = 0"
    try:
        f_test = results.f_test(hypothesis)
        f_stat = f_test.statistic
        
        # If f_test is a multi-dimensional array, get the scalar value
        if isinstance(f_stat, np.ndarray):
            f_stat = f_stat.item()
            p_val = f_test.pvalue.item()
        else:
            p_val = f_test.pvalue
            
        passes = p_val > 0.05
    except Exception as e:
        print("Warning: F-test failed, probably due to singularity or missing data.", e)
        f_stat = np.nan
        p_val = np.nan
        passes = False
        
    coefs = {term: results.params[term] for term in interaction_terms}
    
    return {
        'f_statistic': f_stat,
        'p_value': p_val,
        'coefficients': coefs,
        'passes': passes
    }

def plot_parallel_trends(df):
    """Plot raw pre-period average price trends for treated vs control."""
    pre_df = df[(df['year'] >= 2009) & (df['year'] <= 2014)].copy()
    
    # Aggregate to quarterly
    trend = pre_df.groupby(['year_quarter', 'treated'])['declared_price_sqft'].mean().reset_index()
    
    # Needs to convert year_quarter string to datetime or period for nice plotting
    trend['year_quarter'] = pd.PeriodIndex(trend['year_quarter'], freq='Q').to_timestamp()
    
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=trend, x='year_quarter', y='declared_price_sqft', hue='treated', 
                 palette={0: 'blue', 1: 'red'}, marker='o')
    plt.title('Pre-Treatment Price Trends (2009-2014)')
    plt.xlabel('Quarter')
    plt.ylabel('Average Declared Price (SqFt)')
    plt.legend(title='Group', labels=['Control', 'Treated'])
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('outputs/parallel_trends_raw.png', dpi=300)
    plt.close()

def run_event_study(df):
    """Full event study model."""
    df_es = df.copy()
    
    # Create event time dummies
    # We omit event_time = -1 (which would be -1.0)
    for t in range(-5, 9):
        if t != -1:
            t_str = f"m{-t}" if t < 0 else str(t)
            col_name = f'treated_evt_{t_str}'
            df_es[col_name] = ((df_es['event_time'] == t) & (df_es['treated'] == 1)).astype(int)
            
    # Formula components
    evt_cols = [f'treated_evt_m{-t}' if t < 0 else f'treated_evt_{t}' for t in range(-5, 9) if t != -1]
    formula = "log_price_sqft ~ " + " + ".join(evt_cols) + " + C(sub_registrar_office) + C(year_quarter) + log_area_sqft + C(property_type) + construction_period"
    
    model = smf.ols(formula, data=df_es)
    results = model.fit(cov_type='cluster', cov_kwds={'groups': df_es['sub_registrar_office']})
    
    es_results = []
    
    for t in range(-5, 9):
        if t == -1:
            es_results.append({
                'event_time': t,
                'coefficient': 0.0,
                'std_error': 0.0,
                'ci_lower': 0.0,
                'ci_upper': 0.0
            })
        else:
            t_str = f"m{-t}" if t < 0 else str(t)
            col_name = f'treated_evt_{t_str}'
            if col_name in results.params:
                es_results.append({
                    'event_time': t,
                    'coefficient': results.params[col_name],
                    'std_error': results.bse[col_name],
                    'ci_lower': results.conf_int().loc[col_name][0],
                    'ci_upper': results.conf_int().loc[col_name][1]
                })
                
    return pd.DataFrame(es_results)

def plot_event_study(event_study_df):
    plt.figure(figsize=(12, 7))
    
    x = event_study_df['event_time']
    y = event_study_df['coefficient'] * 100 # Convert to percentage
    y_err_lower = (event_study_df['coefficient'] - event_study_df['ci_lower']) * 100
    y_err_upper = (event_study_df['ci_upper'] - event_study_df['coefficient']) * 100
    
    plt.errorbar(x, y, yerr=[y_err_lower, y_err_upper], fmt='o', color='black', 
                 capsize=5, capthick=2, elinewidth=2, markersize=8)
                 
    plt.fill_between(x, event_study_df['ci_lower']*100, event_study_df['ci_upper']*100, color='gray', alpha=0.2)
    
    plt.axvline(x=0, color='blue', linestyle='--', linewidth=2, label='Station Opening')
    plt.axhline(y=0, color='red', linestyle='--', linewidth=1)
    
    # Shade regions
    plt.axvspan(-5, -0.5, color='lightcoral', alpha=0.1, label='Pre-treatment (should be ≈ 0)')
    plt.axvspan(-0.5, 8, color='lightgreen', alpha=0.1, label='Treatment effect window')
    
    # Annotate peak
    peak_idx = event_study_df['coefficient'].idxmax()
    peak_row = event_study_df.loc[peak_idx]
    plt.annotate(f"Peak: {peak_row['coefficient']*100:.1f}%", 
                 xy=(peak_row['event_time'], peak_row['coefficient']*100),
                 xytext=(peak_row['event_time']+1, peak_row['coefficient']*100 + 5),
                 arrowprops=dict(facecolor='black', shrink=0.05, width=1.5, headwidth=8))
                 
    plt.title('Event study: causal impact of Chennai Metro on property prices', fontsize=16, fontweight='bold')
    plt.xlabel('Years relative to station opening', fontsize=12)
    plt.ylabel('DiD coefficient (% price impact)', fontsize=12)
    plt.legend(loc='upper left')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('outputs/event_study_plot.png', dpi=300)
    plt.close()

if __name__ == "__main__":
    df = pd.read_parquet('data/processed/matched_panel.parquet')
    
    print("Running parallel trends test...")
    pt_results = parallel_trends_test(df)
    print(f"Parallel Trends F-stat: {pt_results['f_statistic']:.3f}, p-value: {pt_results['p_value']:.4f}")
    print(f"Passes assumed parallel trends test? {pt_results['passes']}")
    
    print("Plotting parallel trends...")
    plot_parallel_trends(df)
    
    print("Running event study model...")
    es_df = run_event_study(df)
    
    print("Plotting event study...")
    plot_event_study(es_df)
    print("Event study complete.")
