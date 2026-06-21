import os
import sys
import tempfile
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List

# Add the parent directory of 'app' to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml_pipeline import LuxuryMLPipeline
from app.pdf_generator import generate_pdf_report
from app.analytics import calculate_dataset_analytics

# Initialize FastAPI App
app = FastAPI(
    title="EstateGPT Elite Backend",
    description="The Luxury Real Estate Intelligence Platform API",
    version="1.0.0"
)

# Enable CORS for local React development (Vite runs on 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Pipeline on startup
pipeline = LuxuryMLPipeline()

# --- REQUEST/RESPONSE SCHEMAS ---

class PropertyFeatures(BaseModel):
    area: float = Field(..., example=6000.0, description="Total area in square feet")
    bedrooms: int = Field(..., example=4, description="Number of bedrooms")
    bathrooms: int = Field(..., example=2, description="Number of bathrooms")
    stories: int = Field(..., example=2, description="Number of stories")
    mainroad: str = Field(..., example="yes", description="Connected to main road: yes/no")
    guestroom: str = Field(..., example="yes", description="Has guest room: yes/no")
    basement: str = Field(..., example="no", description="Has basement: yes/no")
    hotwaterheating: str = Field(..., example="no", description="Has hot water heating: yes/no")
    airconditioning: str = Field(..., example="yes", description="Has AC: yes/no")
    parking: int = Field(..., example=2, description="Number of parking spots")
    prefarea: str = Field(..., example="yes", description="Located in preferred area: yes/no")
    furnishingstatus: str = Field(..., example="furnished", description="furnished/semi-furnished/unfurnished")

class UpgradeRequest(BaseModel):
    features: PropertyFeatures
    upgrades: List[str] = Field(..., example=["Swimming Pool", "Smart Home System"])

class NegotiationRequest(BaseModel):
    predicted_price: float
    luxury_score: float
    prefarea: str
    mainroad: str

# --- ENDPOINTS ---

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "dataset_rows": len(pipeline.df) if pipeline.df is not None else 0,
        "model_loaded": pipeline.model is not None
    }

@app.post("/api/predict")
def predict_price(features: PropertyFeatures):
    """
    Predicts property price and returns full luxury intelligence scorecard.
    """
    if pipeline.model is None:
        raise HTTPException(status_code=500, detail="Machine learning model is not loaded.")
    
    try:
        results = pipeline.predict_property(features.dict())
        # Append rmse to results for display/reporting
        results["rmse"] = pipeline.rmse
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/api/upgrade")
def simulate_upgrades(request: UpgradeRequest):
    """
    Simulates the value increases and ROI of adding premium upgrades.
    """
    inputs = request.features.dict()
    upgrades = request.upgrades
    
    # Calculate base prediction
    base_res = pipeline.predict_property(inputs)
    base_price = base_res["predicted_price"]
    
    # Modify inputs based on selected upgrades
    modified_inputs = inputs.copy()
    added_luxury_points = 0.0
    estimated_cost = 0.0
    
    for upgrade in upgrades:
        if upgrade == "Smart Home System":
            modified_inputs["airconditioning"] = "yes"
            added_luxury_points += 5.0
            estimated_cost += 350000.0
        elif upgrade == "Solar Panels":
            added_luxury_points += 4.0
            estimated_cost += 450000.0
        elif upgrade == "Swimming Pool":
            modified_inputs["prefarea"] = "yes"
            added_luxury_points += 12.0
            estimated_cost += 1500000.0
        elif upgrade == "Home Theater":
            modified_inputs["guestroom"] = "yes"
            added_luxury_points += 8.0
            estimated_cost += 800000.0
        elif upgrade == "Private Gym":
            added_luxury_points += 6.0
            estimated_cost += 600000.0
        elif upgrade == "Luxury Garden":
            added_luxury_points += 5.0
            estimated_cost += 400000.0
        elif upgrade == "EV Charging Station":
            added_luxury_points += 3.0
            estimated_cost += 200000.0
        elif upgrade == "Rooftop Lounge":
            modified_inputs["stories"] = min(4, modified_inputs["stories"] + 1)
            added_luxury_points += 10.0
            estimated_cost += 1200000.0

    # Get new prediction
    new_res = pipeline.predict_property(modified_inputs)
    
    # Direct luxury adjustment
    adjusted_luxury = min(100.0, base_res["luxury_score"] + added_luxury_points)
    # The upgraded price is simulated as the predicted price plus a luxury premium
    predicted_upgraded_price = new_res["predicted_price"] * (1 + (added_luxury_points / 200.0))
    
    value_increase = max(0.0, predicted_upgraded_price - base_price)
    roi_pct = (value_increase / estimated_cost * 100) if estimated_cost > 0 else 0.0
    
    return {
        "base_price": base_price,
        "upgraded_price": round(predicted_upgraded_price, 2),
        "value_increase": round(value_increase, 2),
        "upgrade_cost": estimated_cost,
        "roi_pct": round(roi_pct, 2),
        "luxury_score_before": base_res["luxury_score"],
        "luxury_score_after": round(adjusted_luxury, 2)
    }

@app.post("/api/recommend")
def recommend_similar_properties(features: PropertyFeatures):
    """
    Returns the top 5 similar properties matching the requested parameters.
    """
    try:
        similar = pipeline.get_similar_properties(features.dict())
        return similar
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Similarity error: {str(e)}")

@app.post("/api/negotiation")
def calculate_negotiation(request: NegotiationRequest):
    """
    Generates bidding intelligence, advantages, and strategy advice.
    """
    fmv = request.predicted_price
    pref = str(request.prefarea).lower() in ("yes", "true", "1")
    main = str(request.mainroad).lower() in ("yes", "true", "1")
    lux = request.luxury_score
    
    # Seller Power calculations
    seller_power = 40.0
    if pref:
        seller_power += 20.0
    if main:
        seller_power += 10.0
    if lux > 75:
        seller_power += 20.0
    elif lux > 50:
        seller_power += 10.0
        
    seller_power = float(min(90.0, max(15.0, seller_power)))
    buyer_power = float(100.0 - seller_power)
    
    # Recommended offer ranges
    if buyer_power > 60:
        recommended_offer = fmv * 0.90 # 10% discount in buyer's market
        negotiation_str = "Aggressive Buyer Power (Strong Discount Recommended)"
    elif buyer_power > 45:
        recommended_offer = fmv * 0.94 # 6% discount in balanced market
        negotiation_str = "Balanced Power (Moderate Negotiation Potential)"
    else:
        recommended_offer = fmv * 0.97 # 3% discount in hot seller market
        negotiation_str = "High Seller Premium (Low Bidding Room)"
        
    return {
        "fair_market_value": round(fmv, 2),
        "recommended_offer": round(recommended_offer, 2),
        "seller_advantage_pct": round(seller_power, 2),
        "buyer_advantage_pct": round(buyer_power, 2),
        "negotiation_strategy": negotiation_str
    }

@app.get("/api/analytics")
def get_analytics():
    """
    Returns pre-computed dataset analysis (distribution lists, scatter points, heatmaps).
    """
    try:
        stats = calculate_dataset_analytics(pipeline)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation error: {str(e)}")

@app.post("/api/report")
def download_pdf_report(payload: dict = Body(...)):
    """
    Generates and downloads a custom ReportLab PDF valuation report.
    """
    try:
        # Create a temporary file to save the generated PDF
        temp_file = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        temp_file_path = temp_file.name
        temp_file.close()
        
        # Inject pipeline statistics if not present in client data
        payload["rmse"] = pipeline.rmse
        
        generate_pdf_report(payload, temp_file_path)
        
        return FileResponse(
            temp_file_path, 
            media_type="application/pdf", 
            filename="EstateGPT_Elite_Executive_Report.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
