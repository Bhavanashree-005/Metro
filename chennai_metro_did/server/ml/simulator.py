import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from ml.pipeline import get_data

class CausalSimulator:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.baseline_trend = 0.05 # 5% per year natural appreciation

    def _train_if_needed(self):
        df, _ = get_data()
        if df.empty:
            return
            
        if not self.is_trained:
            # Simple model to predict price based on sqft, dist, and year
            # Target = market price
            df_train = df.copy()
            df_train['log_price'] = np.log(df_train['price_sqft'])
            
            X = df_train[['area_sqft', 'distance_to_metro_m', 'year']]
            y = df_train['log_price']
            
            self.model = Ridge().fit(X, y)
            self.is_trained = True

    def predict(self, sqft, distance_m, year):
        self._train_if_needed()
        df, _ = get_data()
        
        if self.model is None:
            # Fallback mock prediction if model training fails or no data
            price_sqft = 6500 * (1.05 ** (year - 2024))
            dist_premium = 0.12 if distance_m < 500 else 0.05 if distance_m < 1000 else 0
            predicted = price_sqft * (1 + dist_premium)
            counterfactual = price_sqft
        else:
            # Use real model
            X_pred = pd.DataFrame([[sqft, distance_m, year]], columns=['area_sqft', 'distance_to_metro_m', 'year'])
            predicted_log = self.model.predict(X_pred)[0]
            predicted = np.exp(predicted_log)
            
            # Counterfactual: set distance to "infinity" (control zone > 2000m)
            X_cf = pd.DataFrame([[sqft, 3000, year]], columns=['area_sqft', 'distance_to_metro_m', 'year'])
            cf_log = self.model.predict(X_cf)[0]
            counterfactual = np.exp(cf_log)

        premium = predicted - counterfactual
        pct = (predicted / counterfactual - 1) * 100

        return {
            "predicted_price_sqft": round(float(predicted), 2),
            "counterfactual_price_sqft": round(float(counterfactual), 2),
            "metro_premium_sqft": round(float(premium), 2),
            "percentage_increase": round(float(pct), 1)
        }

# Singleton instance
simulator = CausalSimulator()
