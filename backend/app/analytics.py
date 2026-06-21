import numpy as np
import pandas as pd

def calculate_dataset_analytics(pipeline) -> dict:
    """
    Pre-computes correlation, histograms, scatter data, and feature importances 
    from the SQLite/CSV dataset to render charts on the React frontend.
    """
    df = pipeline.df
    df_processed = pipeline.preprocess_df(df)
    
    # 1. Price Distribution Histogram (10 bins)
    prices = df_processed["price"].values
    counts, bin_edges = np.histogram(prices, bins=10)
    price_dist = []
    for i in range(len(counts)):
        bin_label = f"₹{int(bin_edges[i]/100000)}L – ₹{int(bin_edges[i+1]/100000)}L"
        price_dist.append({"bin": bin_label, "count": int(counts[i])})
        
    # 2. Correlation Matrix Heatmap
    corr_features = ["price", "area", "bedrooms", "bathrooms", "stories", "parking", "airconditioning"]
    corr_matrix = df_processed[corr_features].corr()
    correlation_list = []
    for col1 in corr_features:
        for col2 in corr_features:
            correlation_list.append({
                "x": col1,
                "y": col2,
                "value": round(float(corr_matrix.loc[col1, col2]), 3)
            })

    # 3. Actual vs Predicted Scatter Plot (50 sample data points)
    # Take a random 50 properties to keep payload small and plot clean
    sample_df = df_processed.sample(50, random_state=42)
    X_sample = sample_df[pipeline.features]
    y_actual = sample_df["price"].values
    y_predicted = pipeline.model.predict(X_sample)
    
    actual_vs_pred = []
    for act, pred in zip(y_actual, y_predicted):
        actual_vs_pred.append({
            "actual": float(act),
            "predicted": float(pred)
        })

    # 4. Feature Importance
    feat_importances = []
    for col, imp in pipeline.feature_importances.items():
        feat_importances.append({
            "feature": col,
            "importance": round(imp * 100, 2)
        })
    feat_importances.sort(key=lambda x: x["importance"], reverse=True)

    # 5. Luxury Score Distribution Bins
    luxury_scores = []
    for idx, row in df_processed.iterrows():
        area_score = min((row["area"] / 12000) * 30, 30)
        bath_score = min(row["bathrooms"] * 10, 20)
        stories_score = min(row["stories"] * 5, 10)
        parking_score = min(row["parking"] * 5, 10)
        ac_score = 10.0 if row["airconditioning"] == 1.0 else 0.0
        furn_score = 10.0 if row["furnishingstatus"] == 2.0 else (5.0 if row["furnishingstatus"] == 1.0 else 0.0)
        amenities = sum([
            row["guestroom"] * 2.0,
            row["basement"] * 2.0,
            row["hotwaterheating"] * 2.0,
            row["prefarea"] * 2.0,
            row["mainroad"] * 2.0
        ])
        luxury = float(min(100.0, area_score + bath_score + stories_score + parking_score + ac_score + furn_score + amenities))
        luxury_scores.append(luxury)
        
    counts_lux, bin_edges_lux = np.histogram(luxury_scores, bins=5, range=(0, 100))
    luxury_dist = []
    ranges = ["0-20 Bronze", "21-40 Silver", "41-60 Gold", "61-80 Platinum", "81-100 Diamond/Elite"]
    for i in range(len(counts_lux)):
        luxury_dist.append({
            "range": ranges[i],
            "count": int(counts_lux[i])
        })

    # 6. Global Stats
    global_stats = {
        "total_properties": len(df),
        "mean_price": float(df["price"].mean()),
        "max_price": float(df["price"].max()),
        "min_price": float(df["price"].min()),
        "mean_area": float(df["area"].mean()),
        "mean_luxury": float(np.mean(luxury_scores))
    }

    return {
        "price_distribution": price_dist,
        "correlation_heatmap": correlation_list,
        "actual_vs_predicted": actual_vs_pred,
        "feature_importances": feat_importances,
        "luxury_distribution": luxury_dist,
        "global_stats": global_stats
    }
