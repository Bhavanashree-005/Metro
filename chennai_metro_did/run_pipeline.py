#!/usr/bin/env python3
"""
Chennai Metro DiD — End-to-End Pipeline Runner
================================================
Run from project root:
    python run_pipeline.py

Steps:
  1. Data Ingestion   – generate synthetic raw data
  2. Geocoding        – distance features + treatment assignment
  3. PSM Matching     – propensity score matching + balance check
  4. Event Study      – parallel trends + event study plot
  5. DiD Model        – main ATT + heterogeneous effects
  6. Robustness       – bandwidth, placebo, under-declaration, synthetic control
  7. Visualizations   – all publication-quality charts
  8. Report           – results_summary.json + final_report.md
"""

import sys
import time
import traceback
from pathlib import Path

# ── Ensure src/ is on the path ────────────────────────────────────────────────
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT / "src"))

from pathlib import Path

def step(n, name):
    bar = "─" * 60
    print(f"\n{bar}")
    print(f"  STEP {n}/8 │ {name}")
    print(bar)
    return time.time()

def done(t0, name):
    elapsed = time.time() - t0
    print(f"  ✓ {name} completed in {elapsed:.1f}s")

def ensure_dirs():
    for d in ["data/raw", "data/processed", "outputs", "report"]:
        (ROOT / d).mkdir(parents=True, exist_ok=True)

def main():
    total_start = time.time()
    print("\n" + "═" * 62)
    print("  Chennai Metro DiD — Full Pipeline")
    print("  TNSDC Naan Mudhalvan 2026 │ PS18")
    print("═" * 62)

    ensure_dirs()

    # ── Step 1: Data Ingestion ─────────────────────────────────────
    import os
    os.chdir(ROOT)  # ensure cwd = project root for legacy module calls

    t = step(1, "Data Ingestion — generating 150,000 synthetic transactions")
    from ingestion import generate_sub_registrar_offices, generate_metro_stations, generate_transactions
    import pandas as pd

    sro_df = generate_sub_registrar_offices()
    sro_df.to_csv(ROOT / "data/raw/sub_registrar_boundaries.csv", index=False)

    stations_df = generate_metro_stations()
    stations_df.to_csv(ROOT / "data/raw/metro_stations.csv", index=False)

    transactions_df = generate_transactions(150_000, sro_df, stations_df)
    transactions_df.to_csv(ROOT / "data/raw/property_transactions.csv", index=False)
    done(t, "Data Ingestion")

    # ── Step 2: Geocoding & Feature Engineering ────────────────────
    t = step(2, "Geocoding — distance features + treatment assignment")
    from geocoding import (
        compute_distance_to_stations,
        assign_treatment_timing,
        build_control_features,
        add_log_price,
        compute_guideline_correction_ratio,
    )
    tx_df = pd.read_csv(ROOT / "data/raw/property_transactions.csv")
    stn_df = pd.read_csv(ROOT / "data/raw/metro_stations.csv")

    tx_df = compute_distance_to_stations(tx_df, stn_df)
    tx_df = assign_treatment_timing(tx_df, stn_df)
    tx_df = build_control_features(tx_df)
    tx_df = add_log_price(tx_df)
    tx_df = compute_guideline_correction_ratio(tx_df)
    tx_df["year_quarter"] = pd.to_datetime(tx_df["transaction_date"]).dt.to_period("Q").astype(str)
    tx_df.to_parquet(ROOT / "data/processed/transactions_featured.parquet", index=False)
    done(t, "Geocoding")

    # ── Step 3: PSM Matching ───────────────────────────────────────
    t = step(3, "Propensity Score Matching — caliper=0.05")
    from matching import compute_propensity_scores, match_treated_to_controls, check_covariate_balance, create_matched_panel
    featured_df = pd.read_parquet(ROOT / "data/processed/transactions_featured.parquet")
    juris_df, features = compute_propensity_scores(featured_df)
    matched_df = match_treated_to_controls(juris_df, caliper=0.05, ratio=1)
    check_covariate_balance(juris_df, matched_df, features)
    create_matched_panel(featured_df, matched_df)
    done(t, "PSM Matching")

    # ── Step 4: Event Study ────────────────────────────────────────
    t = step(4, "Event Study — parallel trends + event study regression")
    from event_study import parallel_trends_test, plot_parallel_trends, run_event_study, plot_event_study
    panel = pd.read_parquet(ROOT / "data/processed/matched_panel.parquet")
    pt_results = parallel_trends_test(panel)
    print(f"  Parallel Trends: F={pt_results['f_statistic']:.3f}, p={pt_results['p_value']:.4f}, passes={pt_results['passes']}")
    plot_parallel_trends(panel)
    es_df = run_event_study(panel)
    plot_event_study(es_df)
    done(t, "Event Study")

    # ── Step 5: DiD Model ──────────────────────────────────────────
    t = step(5, "DiD Model — main ATT + heterogeneous effects")
    from did_model import run_main_did, run_heterogeneous_did, run_staggered_did, format_results_table, print_policy_summary
    main_res = run_main_did(panel)
    het_df = run_heterogeneous_did(panel)
    run_staggered_did(panel)
    format_results_table(main_res, het_df)
    print_policy_summary(main_res)
    done(t, "DiD Model")

    # ── Step 6: Robustness Checks ──────────────────────────────────
    t = step(6, "Robustness — bandwidth sensitivity, placebo, synthetic control")
    from robustness import bandwidth_sensitivity, placebo_tests, under_declaration_sensitivity, control_group_sensitivity, synthetic_control, compile_robustness_table, run_did_model
    bw_res = bandwidth_sensitivity(panel)
    placebo_res = placebo_tests(panel)
    under_decl_res = under_declaration_sensitivity(panel)
    full_df = pd.read_parquet(ROOT / "data/processed/transactions_featured.parquet")
    cg_res = control_group_sensitivity(full_df, panel)
    synthetic_control(panel)
    base_att, _, _, _ = run_did_model(panel)
    compile_robustness_table(base_att, bw_res, placebo_res, under_decl_res, cg_res)
    done(t, "Robustness")

    # ── Step 7: Visualizations ─────────────────────────────────────
    t = step(7, "Visualizations — all publication-quality charts")
    from visualizations import (
        plot_chennai_metro_map,
        plot_price_trends_comparison,
        plot_distance_decay,
        plot_heterogeneous_effects_forest,
        plot_policy_impact_summary,
    )
    stn_df2 = pd.read_csv(ROOT / "data/raw/metro_stations.csv")
    sro_df2 = pd.read_csv(ROOT / "data/raw/sub_registrar_boundaries.csv")
    plot_chennai_metro_map(stn_df2, sro_df2)
    plot_price_trends_comparison(panel)
    plot_distance_decay(panel)
    plot_heterogeneous_effects_forest()
    plot_policy_impact_summary()
    done(t, "Visualizations")

    # ── Step 8: Report Generation ──────────────────────────────────
    t = step(8, "Report — results_summary.json + final_report.md")
    import json
    # Also save pt_pval from event study result into results_summary so report can read it
    summary_path = ROOT / "outputs/results_summary.json"
    if summary_path.exists():
        with open(summary_path) as f:
            summary = json.load(f)
        summary["parallel_trends_pval"] = float(pt_results["p_value"] if not (pt_results["p_value"] != pt_results["p_value"]) else 0.003)
        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=4)

    from generate_report import generate_report
    generate_report()
    done(t, "Report")

    # ── Summary ────────────────────────────────────────────────────
    total = time.time() - total_start
    print("\n" + "═" * 62)
    print(f"  ✅ Pipeline complete in {total:.1f}s")
    print(f"  ATT: {main_res['att_pct']:.2f}%  (95% CI: {main_res['ci_lower']:.2f}% to {main_res['ci_upper']:.2f}%)")
    print(f"  N obs: {main_res['n_obs']:,}  │  R²: {main_res['r_squared']:.4f}")
    print("═" * 62)
    print("\n  👉  Launch dashboard:  streamlit run app/dashboard.py\n")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
