# Chennai Metro Rail Phase 1 — Causal Impact Analysis

> **TNSDC Naan Mudhalvan 2026 Hackathon · PS18**  
> Rigorous DiD + PSM causal inference on residential property value uplift from Chennai Metro Phase 1

---

## 🚇 What This Project Does

This project quantifies the **causal** impact of Chennai Metro Rail Phase 1 on residential property values using a rigorous econometric pipeline:

| Step | Method | Output |
|------|--------|--------|
| Data generation | 150k synthetic Tamil Nadu registration transactions (2009–2024) | `data/raw/` |
| Feature engineering | Haversine distances, treatment timing, log-price transformation | `data/processed/` |
| Identification | Propensity Score Matching (PSM) for valid control groups | `outputs/love_plot.png` |
| Estimation | Difference-in-Differences with two-way FE | `outputs/main_results_table.csv` |
| Validation | Event study, parallel trends F-test | `outputs/event_study_plot.png` |
| Robustness | Bandwidth sensitivity, placebo, synthetic control | `outputs/robustness_table.csv` |
| Reporting | JSON summary + Markdown report | `report/final_report.md` |

**Key result:** ~9.3% causal property price premium within 1km of a station, with distance decay peaking at ~18% within 500m.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /path/to/chennai_metro_did
pip3 install -r requirements.txt
```

### 2. Run the Full Pipeline (generates all data & outputs)

```bash
python run_pipeline.py
```

Expected runtime: ~3–5 minutes on a standard laptop.

### 3. Launch the Dashboard

```bash
streamlit run app/dashboard.py
```

Open [http://localhost:8501](http://localhost:8501).

---

## 📁 Project Structure

```
chennai_metro_did/
├── run_pipeline.py          ← Single-command pipeline runner
├── requirements.txt         ← All Python dependencies
├── .streamlit/
│   └── config.toml          ← Dark theme configuration
├── app/
│   └── dashboard.py         ← Premium 7-tab Streamlit dashboard
├── src/
│   ├── ingestion.py         ← Synthetic data generation
│   ├── geocoding.py         ← Distance features + treatment assignment
│   ├── matching.py          ← Propensity score matching
│   ├── event_study.py       ← Parallel trends + event study
│   ├── did_model.py         ← Main DiD + heterogeneous effects
│   ├── robustness.py        ← Robustness checks + synthetic control
│   ├── visualizations.py    ← All publication-quality charts
│   └── generate_report.py   ← Report + JSON summary
├── data/
│   ├── raw/                 ← Generated CSV files
│   └── processed/           ← Parquet panel datasets
├── outputs/                 ← All charts, tables, HTML map
└── report/                  ← final_report.md + executive_summary
```

---

## 📊 Dashboard Tabs

| Tab | Content |
|-----|---------|
| 🏙️ Overview | Key finding callout, KPI cards, methodology comparison |
| 🗺️ Interactive Map | Live Folium map with stations, buffers, SRO jurisdictions |
| 📊 Price Trends | 4-panel chart + interactive trend explorer with year slider |
| 🔬 Methodology | Propensity score overlap, Love plot, model specification |
| 📈 Results | Event study, forest plot, distance decay, results tables |
| 🛡️ Robustness | Bandwidth sensitivity, permutation test, synthetic controls |
| 💰 Policy Calculator | Phase 2 land value capture calculator + international benchmarks |

---

## 🔬 Methodology

### Causal Identification Strategy

```
Naive OLS:  properties near metro WERE already more valuable (selection bias)
DiD + PSM:  compare matched treated vs control BEFORE and AFTER station opening
```

**Key assumption:** Parallel Trends — matched control jurisdictions would have followed the same price trajectory as treated jurisdictions absent the metro.

### Difference-in-Differences Specification

```
log(price_sqft)ᵢₜ = α + β·(Treatᵢ × Postᵢₜ) + γᵢ + δₜ + X·θ + εᵢₜ
```

- `β` = Average Treatment Effect on the Treated (ATT) — our causal estimate
- `γᵢ` = Sub-Registrar Office fixed effects
- `δₜ` = Quarter-year fixed effects
- Standard errors clustered at jurisdiction level

---

## 📚 References

1. Callaway & Sant'Anna (2021). *Difference-in-Differences with Multiple Time Periods.* Journal of Econometrics.
2. Rosen (1974). *Hedonic Prices and Implicit Markets.* Journal of Political Economy.
3. Rosenbaum & Rubin (1983). *The Central Role of the Propensity Score.* Biometrika.
4. Chennai Metro Rail Ltd. Phase 1 corridor data (simulated).

---

*Built for TNSDC Naan Mudhalvan 2026 Hackathon · PS18*
