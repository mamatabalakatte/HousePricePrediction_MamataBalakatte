import unittest
import os
import sys
import tempfile
import json
from fastapi.testclient import TestClient

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml_pipeline import LuxuryMLPipeline
from app.main import app


class TestEstateGPTBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Initializes pipeline and test client."""
        cls.pipeline = LuxuryMLPipeline()
        cls.client = TestClient(app)
        
        # Test input property features
        cls.sample_features = {
            "area": 6000.0,
            "bedrooms": 4,
            "bathrooms": 2,
            "stories": 2,
            "mainroad": "yes",
            "guestroom": "no",
            "basement": "no",
            "hotwaterheating": "no",
            "airconditioning": "yes",
            "parking": 2,
            "prefarea": "yes",
            "furnishingstatus": "furnished"
        }

    def test_pipeline_prediction_keys(self):
        """Tests that the ML pipeline output contains all the required luxury scores."""
        res = self.pipeline.predict_property(self.sample_features)
        
        self.assertIn("predicted_price", res)
        self.assertIn("luxury_score", res)
        self.assertIn("luxury_grade", res)
        self.assertIn("prestige_score", res)
        self.assertIn("prestige_tier", res)
        self.assertIn("house_dna", res)
        self.assertIn("contributions", res)
        self.assertIn("forecast", res)
        
        # Assert type
        self.assertTrue(isinstance(res["predicted_price"], float))
        self.assertTrue(isinstance(res["luxury_score"], float))
        self.assertTrue(0 <= res["luxury_score"] <= 100)

    def test_similar_properties(self):
        """Tests that similarity recommendation returns a list of 5 properties."""
        similar = self.pipeline.get_similar_properties(self.sample_features, limit=5)
        self.assertEqual(len(similar), 5)
        for prop in similar:
            self.assertIn("similarity_pct", prop)
            self.assertIn("price", prop)
            self.assertIn("luxury_score", prop)
            self.assertTrue(0 <= prop["similarity_pct"] <= 100)

    def test_api_health(self):
        """Tests health check API."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["dataset_rows"] > 0)

    def test_api_predict(self):
        """Tests prediction REST endpoint."""
        res = self.client.post("/api/predict", json=self.sample_features)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["predicted_price"] > 0)
        self.assertEqual(data["luxury_grade"], "Diamond")  # matches formula for sample inputs

    def test_api_upgrade_simulator(self):
        """Tests upgrade simulator endpoint."""
        payload = {
            "features": self.sample_features,
            "upgrades": ["Smart Home System", "Swimming Pool"]
        }
        res = self.client.post("/api/upgrade", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("base_price", data)
        self.assertIn("upgraded_price", data)
        self.assertIn("value_increase", data)
        self.assertTrue(data["value_increase"] > 0)
        self.assertTrue(data["roi_pct"] > 0)

    def test_api_negotiation(self):
        """Tests negotiation advisor endpoint."""
        payload = {
            "predicted_price": 5000000.0,
            "luxury_score": 85.0,
            "prefarea": "yes",
            "mainroad": "yes"
        }
        res = self.client.post("/api/negotiation", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("fair_market_value", data)
        self.assertIn("recommended_offer", data)
        self.assertIn("seller_advantage_pct", data)
        self.assertTrue(data["recommended_offer"] < 5000000.0)

    def test_api_analytics(self):
        """Tests analytics charts endpoints."""
        res = self.client.get("/api/analytics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("price_distribution", data)
        self.assertIn("correlation_heatmap", data)
        self.assertIn("actual_vs_predicted", data)
        self.assertIn("feature_importances", data)
        self.assertIn("luxury_distribution", data)

    def test_api_report(self):
        """Tests PDF report generation endpoint."""
        predict_res = self.client.post("/api/predict", json=self.sample_features)
        self.assertEqual(predict_res.status_code, 200)
        predict_data = predict_res.json()
        
        res = self.client.post("/api/report", json=predict_data)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("content-type"), "application/pdf")
        self.assertTrue(len(res.content) > 0)


if __name__ == "__main__":
    unittest.main()
