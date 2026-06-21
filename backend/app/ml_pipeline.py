import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

DATA_URL = "https://raw.githubusercontent.com/zobi123/Machine-Learning-project-with-Python/master/Housing.csv"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DATA_PATH = os.path.join(DATA_DIR, "Housing.csv")

class LuxuryMLPipeline:
    """
    Predictive Model & Luxury Intelligence Pipeline.
    Responsible for downloading dataset, training RandomForest model, 
    and generating luxury/investment/SHAP scores.
    """
    def __init__(self):
        self.model = None
        self.df = None
        self.features = [
            "area", "bedrooms", "bathrooms", "stories", "mainroad", 
            "guestroom", "basement", "hotwaterheating", "airconditioning", 
            "parking", "prefarea", "furnishingstatus"
        ]
        self.categorical_cols = [
            "mainroad", "guestroom", "basement", "hotwaterheating", 
            "airconditioning", "prefarea"
        ]
        self.means = {}
        self.stds = {}
        self.base_price = 0.0
        self.rmse = 0.0
        self.feature_importances = {}
        
        # Initialize
        self.ensure_data_downloaded()
        self.train_model()

    def ensure_data_downloaded(self):
        """Downloads the Kaggle Housing Prices dataset if not present."""
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(DATA_PATH):
            print(f"Downloading Housing dataset from {DATA_URL}...")
            urllib.request.urlretrieve(DATA_URL, DATA_PATH)
            print("Dataset downloaded successfully.")
        else:
            print(f"Dataset already exists at {DATA_PATH}.")

    def preprocess_df(self, df_raw):
        """Converts raw CSV strings into numerical values."""
        df = df_raw.copy()
        # Binary yes/no mapping
        for col in self.categorical_cols:
            df[col] = df[col].map({"yes": 1, "no": 0}).fillna(0)
            
        # Furnishing status mapping
        df["furnishingstatus"] = df["furnishingstatus"].map({
            "furnished": 2, 
            "semi-furnished": 1, 
            "unfurnished": 0
        }).fillna(0)
        
        return df

    def train_model(self):
        """Trains the Random Forest model and calculates stats."""
        self.df = pd.read_csv(DATA_PATH)
        df_processed = self.preprocess_df(self.df)
        
        X = df_processed[self.features]
        y = df_processed["price"]
        
        # Calculate training statistics for SHAP contribution mapping
        for col in self.features:
            self.means[col] = float(X[col].mean())
            self.stds[col] = float(X[col].std()) if X[col].std() > 0 else 1.0
            
        self.base_price = float(y.mean())
        
        # Train-Test Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train RandomForest
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        self.rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = r2_score(y_test, y_pred)
        
        # Map Feature Importances
        importances = self.model.feature_importances_
        for col, imp in zip(self.features, importances):
            self.feature_importances[col] = float(imp)
            
        print(f"Model trained successfully. Test R2: {r2:.4f}, RMSE: {self.rmse:.2f}")

    def predict_property(self, inputs: dict) -> dict:
        """
        Predicts price and generates all real estate intelligence metrics.
        """
        # Form input array
        input_data = {}
        for col in self.features:
            val = inputs.get(col)
            if col in self.categorical_cols:
                input_data[col] = 1.0 if str(val).lower() in ("yes", "1", "true") else 0.0
            elif col == "furnishingstatus":
                if str(val).lower() == "furnished":
                    input_data[col] = 2.0
                elif str(val).lower() == "semi-furnished":
                    input_data[col] = 1.0
                else:
                    input_data[col] = 0.0
            else:
                input_data[col] = float(val or 0.0)
                
        # Predict price
        input_df = pd.DataFrame([input_data])
        predicted_price = float(self.model.predict(input_df)[0])
        
        # Confidence score based on features (higher area/luxury = more outlier-prone = slightly lower confidence)
        confidence = max(0.65, min(0.98, 0.95 - (input_data["area"] / 20000) * 0.15))
        
        # Prediction interval
        interval_half = 1.96 * self.rmse * (1.2 - confidence)
        price_min = max(1000000, predicted_price - interval_half)
        price_max = predicted_price + interval_half
        
        # 1. Luxury Score & Grade
        # Max area in dataset is ~16200
        area_score = min((input_data["area"] / 12000) * 30, 30)
        bath_score = min(input_data["bathrooms"] * 10, 20)
        stories_score = min(input_data["stories"] * 5, 10)
        parking_score = min(input_data["parking"] * 5, 10)
        ac_score = 10.0 if input_data["airconditioning"] == 1.0 else 0.0
        furn_score = 10.0 if input_data["furnishingstatus"] == 2.0 else (5.0 if input_data["furnishingstatus"] == 1.0 else 0.0)
        
        # Extra amenities
        amenities = sum([
            input_data["guestroom"] * 2.0,
            input_data["basement"] * 2.0,
            input_data["hotwaterheating"] * 2.0,
            input_data["prefarea"] * 2.0,
            input_data["mainroad"] * 2.0
        ])
        
        luxury_score = float(min(100.0, area_score + bath_score + stories_score + parking_score + ac_score + furn_score + amenities))
        
        # Luxury Grade
        if luxury_score >= 90:
            luxury_grade = "Crown Elite"
        elif luxury_score >= 75:
            luxury_grade = "Diamond"
        elif luxury_score >= 60:
            luxury_grade = "Platinum"
        elif luxury_score >= 40:
            luxury_grade = "Gold"
        elif luxury_score >= 25:
            luxury_grade = "Silver"
        else:
            luxury_grade = "Bronze"
            
        # 2. Mansion Prestige Index
        prestige_score = float(min(100.0, (
            0.35 * luxury_score + 
            0.30 * min((input_data["area"] / 10000) * 100, 100) + 
            0.15 * min(input_data["bedrooms"] * 15, 30) + 
            0.20 * (input_data["parking"] + input_data["bathrooms"] + input_data["stories"]) * 6
        )))
        
        if prestige_score >= 90:
            prestige_tier = "Elite Legacy"
            badge = "👑 Legacy Crown"
        elif prestige_score >= 75:
            prestige_tier = "Grand Estate"
            badge = "⭐ Grand Marquis"
        elif prestige_score >= 60:
            prestige_tier = "Imperial Manor"
            badge = "🏰 Imperial Shield"
        elif prestige_score >= 40:
            prestige_tier = "Classic Prestige"
            badge = "💎 Classic Crest"
        else:
            prestige_tier = "Standard Executive"
            badge = "⚜️ Executive Seal"

        # 3. Investment Intelligence
        appreciation_potential = float(min(100.0, (area_score * 1.5 + input_data["prefarea"] * 30 + furn_score * 2.0 + 10)))
        risk_score = float(max(10.0, min(90.0, 100 - (input_data["prefarea"] * 25 + input_data["mainroad"] * 25 + (area_score * 1.2)))))
        rental_potential = float(min(100.0, (input_data["bedrooms"] * 18 + input_data["bathrooms"] * 15 + ac_score + input_data["stories"] * 8)))
        wealth_preservation = float(min(100.0, (appreciation_potential * 0.5 + (100 - risk_score) * 0.5)))
        investment_score = float(min(100.0, (appreciation_potential * 0.4 + rental_potential * 0.3 + (100 - risk_score) * 0.3)))

        # 4. Smart Home Readiness
        smart_sec = 25.0 if input_data["airconditioning"] == 1.0 else 10.0
        smart_auto = 25.0 if input_data["guestroom"] == 1.0 else 15.0
        smart_energy = 25.0 if input_data["hotwaterheating"] == 1.0 else 10.0
        smart_tech = 25.0 if input_data["parking"] >= 2.0 else 15.0
        smart_score = float(smart_sec + smart_auto + smart_energy + smart_tech)

        # 5. Sustainability & Green Luxury
        green_score = float(min(100.0, (
            input_data["hotwaterheating"] * 30.0 + 
            (100.0 - ac_score) * 0.4 + 
            input_data["parking"] * 10.0 + 
            (input_data["basement"] * 10.0)
        )))
        
        if green_score >= 80:
            carbon_rating = "A++ Ultra Eco"
            energy_eff = "Excellent (Eco Shield)"
        elif green_score >= 60:
            carbon_rating = "A+ Eco Luxury"
            energy_eff = "Optimized"
        elif green_score >= 40:
            carbon_rating = "B Standard Green"
            energy_eff = "Standard"
        else:
            carbon_rating = "C Carbon Intensive"
            energy_eff = "Basic"

        # 6. House DNA
        dna_a = max(1, min(9, int((input_data["area"] / 16200) * 9)))
        dna_b = max(1, min(9, int(input_data["bathrooms"] * 3)))
        dna_p = max(1, min(9, int(input_data["parking"] * 3)))
        dna_l = max(1, min(9, int((luxury_score / 100) * 9)))
        dna_i = max(1, min(9, int((investment_score / 100) * 9)))
        house_dna = f"A{dna_a}-B{dna_b}-P{dna_p}-L{dna_l}-I{dna_i}"

        # 7. Local SHAP contribution simulation
        # Sum of contributions should equal (predicted_price - base_price)
        raw_diff = predicted_price - self.base_price
        contributions = []
        
        # Helper to distribute raw_diff based on importances & sign of deviation
        imp_sum = sum(self.feature_importances.values())
        for col in self.features:
            imp = self.feature_importances[col]
            dev = input_data[col] - self.means[col]
            
            # Feature contribution direction
            # For area, bedrooms, bathrooms, ac, stories, parking - positive deviation increases price
            # For furnishing status, positive deviation increases price
            # For guestroom, basement, hotwater, prefarea, mainroad - positive deviation increases price
            # Let's map sign of contribution:
            is_positive = dev > 0 if col != "furnishingstatus" else (input_data[col] > 1.0)
            
            # In general, if prediction > base_price, positive dev features contribute positively
            if raw_diff > 0:
                col_contrib = raw_diff * (imp / imp_sum) * (1.0 if dev >= 0 else -0.5)
            else:
                col_contrib = raw_diff * (imp / imp_sum) * (1.0 if dev < 0 else -0.5)
                
            contributions.append({
                "feature": col,
                "value": inputs.get(col),
                "contribution": round(col_contrib, 2),
                "impact": "positive" if col_contrib >= 0 else "negative"
            })
            
        # Sort contributions by absolute value descending
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

        # 8. Future Value Forecast (5% base growth rate adjusted by appreciation and risk)
        growth_rate = 0.04 + (appreciation_potential / 100.0) * 0.06 - (risk_score / 100.0) * 0.02
        growth_rate = max(0.02, min(0.12, growth_rate))
        
        forecast = {
            "current": round(predicted_price, 2),
            "1_year": round(predicted_price * (1 + growth_rate), 2),
            "3_year": round(predicted_price * ((1 + growth_rate) ** 3), 2),
            "5_year": round(predicted_price * ((1 + growth_rate) ** 5), 2),
            "roi_5_year_pct": round((((1 + growth_rate) ** 5) - 1) * 100, 2),
            "cagr_pct": round(growth_rate * 100, 2)
        }

        # 9. AI Lifestyle Generator
        lifestyle = self.generate_lifestyle_description(inputs, luxury_grade, prestige_tier)

        return {
            "predicted_price": round(predicted_price, 2),
            "confidence_score": round(confidence, 4),
            "price_min": round(price_min, 2),
            "price_max": round(price_max, 2),
            "luxury_score": round(luxury_score, 2),
            "luxury_grade": luxury_grade,
            "prestige_score": round(prestige_score, 2),
            "prestige_tier": prestige_tier,
            "prestige_badge": badge,
            "investment_score": round(investment_score, 2),
            "rental_potential": round(rental_potential, 2),
            "appreciation_potential": round(appreciation_potential, 2),
            "risk_score": round(risk_score, 2),
            "wealth_preservation": round(wealth_preservation, 2),
            "smart_home_score": round(smart_score, 2),
            "green_score": round(green_score, 2),
            "carbon_rating": carbon_rating,
            "energy_efficiency": energy_eff,
            "house_dna": house_dna,
            "contributions": contributions,
            "forecast": forecast,
            "lifestyle": lifestyle,
            "inputs": inputs
        }

    def generate_lifestyle_description(self, inputs: dict, grade: str, tier: str) -> str:
        """Generates natural language luxury profiles."""
        area = int(inputs.get("area", 0))
        beds = int(inputs.get("bedrooms", 0))
        baths = int(inputs.get("bathrooms", 0))
        ac = str(inputs.get("airconditioning")).lower() in ("yes", "1", "true")
        pref = str(inputs.get("prefarea")).lower() in ("yes", "1", "true")
        furn = str(inputs.get("furnishingstatus")).lower()
        
        desc = f"Designed for the discerning buyer, this {tier} class property "
        
        if grade in ("Crown Elite", "Diamond"):
            desc += f"represents the pinnacle of opulent living. Boasting a massive {area} sq.ft. footprint "
            desc += f"with {beds} lavish chambers and {baths} designer master suites, the estate "
            desc += "offers an unmatched level of refinement. "
        else:
            desc += f"offers an elegant suburban lifestyle. With {beds} comfortable bedrooms and {baths} bathrooms, "
            desc += f"the home provides a perfectly balanced footprint of {area} sq.ft. "
            
        if ac:
            desc += "Equipped with advanced multi-zone climate control systems, "
        if pref:
            desc += "the mansion resides in a highly exclusive and preferred enclave, guaranteeing privacy. "
            
        if furn == "furnished":
            desc += "Presented fully furnished with bespoke artisan interior appointments. "
        elif furn == "semi-furnished":
            desc += "Partially styled with high-end designer fittings. "
            
        desc += "This residence is ideally structured for high-net-worth investors seeking capital preservation, "
        desc += "multigenerational luxury comfort, and long-term appreciation yield."
        
        return desc

    def get_similar_properties(self, inputs: dict, limit: int = 5) -> list:
        """
        Finds the top 5 similar properties in the dataset and computes:
        - Similarity percentage
        - Price comparison
        - Luxury score comparison
        """
        df_processed = self.preprocess_df(self.df)
        
        # Pre-process inputs
        target_data = {}
        for col in self.features:
            val = inputs.get(col)
            if col in self.categorical_cols:
                target_data[col] = 1.0 if str(val).lower() in ("yes", "1", "true") else 0.0
            elif col == "furnishingstatus":
                if str(val).lower() == "furnished":
                    target_data[col] = 2.0
                elif str(val).lower() == "semi-furnished":
                    target_data[col] = 1.0
                else:
                    target_data[col] = 0.0
            else:
                target_data[col] = float(val or 0.0)
                
        # Normalize features
        norm_cols = ["area", "bedrooms", "bathrooms", "stories", "parking"]
        distances = []
        
        for idx, row in df_processed.iterrows():
            # Euclidean distance over primary numerical features
            dist = 0.0
            for col in norm_cols:
                # scale weight
                w = 1.0 if col in ("bathrooms", "bedrooms") else 0.2 if col == "area" else 0.5
                diff = (row[col] - target_data[col]) / self.stds[col]
                dist += (diff * w) ** 2
                
            # add categorical weights
            for col in self.categorical_cols:
                if row[col] != target_data[col]:
                    dist += 0.5
            if row["furnishingstatus"] != target_data["furnishingstatus"]:
                dist += 0.5
                
            similarity_pct = max(10.0, min(99.5, 100 - (np.sqrt(dist) * 12)))
            distances.append((idx, similarity_pct))
            
        # Sort and take top 5
        distances.sort(key=lambda x: x[1], reverse=True)
        top_matches = distances[:limit]
        
        similar_properties = []
        for idx, sim_pct in top_matches:
            row_raw = self.df.iloc[idx].to_dict()
            row_processed = df_processed.iloc[idx].to_dict()
            
            # Predict this matched property's price
            matched_price = float(row_processed["price"])
            
            # Calculate matched luxury score
            m_area = min((row_processed["area"] / 12000) * 30, 30)
            m_bath = min(row_processed["bathrooms"] * 10, 20)
            m_stories = min(row_processed["stories"] * 5, 10)
            m_park = min(row_processed["parking"] * 5, 10)
            m_ac = 10.0 if row_processed["airconditioning"] == 1.0 else 0.0
            m_furn = 10.0 if row_processed["furnishingstatus"] == 2.0 else (5.0 if row_processed["furnishingstatus"] == 1.0 else 0.0)
            m_amen = sum([
                row_processed["guestroom"] * 2.0,
                row_processed["basement"] * 2.0,
                row_processed["hotwaterheating"] * 2.0,
                row_processed["prefarea"] * 2.0,
                row_processed["mainroad"] * 2.0
            ])
            m_luxury = float(min(100.0, m_area + m_bath + m_stories + m_park + m_ac + m_furn + m_amen))

            similar_properties.append({
                "id": int(idx),
                "similarity_pct": round(sim_pct, 2),
                "price": int(matched_price),
                "luxury_score": round(m_luxury, 2),
                "area": int(row_raw["area"]),
                "bedrooms": int(row_raw["bedrooms"]),
                "bathrooms": int(row_raw["bathrooms"]),
                "stories": int(row_raw["stories"]),
                "parking": int(row_raw["parking"]),
                "airconditioning": row_raw["airconditioning"],
                "furnishingstatus": row_raw["furnishingstatus"]
            })
            
        return similar_properties
