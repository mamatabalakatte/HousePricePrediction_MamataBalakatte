# EstateGPT Elite - The Future of Luxury Real Estate Intelligence

http://localhost:5173/


**EstateGPT Elite** is a premium, AI-powered real estate intelligence web platform designed for luxury real estate firms, investment funds, and high-net-worth property buyers. It combines advanced machine learning (Random Forest Regression) with explainable AI (SHAP value contributions) and real estate valuation metrics.

---

## 🚀 Key Features

1. **AI House Price Prediction:** Predicts property value using area, bedrooms, bathrooms, stories, parking, furnishing status, and amenities (AC, preferred area, main road, guest room, basement, hot water).
2. **Luxury Quotient Score:** Evaluates properties based on luxury parameters.
3. **Mansion Prestige Index:** Classifies properties into luxury tiers (e.g. Elite Legacy, Grand Estate).
4. **Investment Yield Simulator:** Estimates future compound appreciation yields and rental potential.
5. **Local SHAP Feature Contributions:** Shows exactly how each property feature impacts the final predicted price.
6. **Executive PDF Report:** Generates a custom ReportLab PDF report containing full analytics and price break-downs.

---

## 📁 Repository Structure

```
├── backend/                      # FastAPI Backend
│   ├── app/                      # ML pipeline, PDF generator, and REST endpoints
│   │   ├── analytics.py          # Pre-computed dataset analytics
│   │   ├── main.py               # REST API endpoints
│   │   ├── ml_pipeline.py        # RandomForest predictive model & luxury scoring
│   │   ├── pdf_generator.py      # ReportLab PDF executive report builder
│   │   └── tests.py              # Backend unit tests
│   ├── data/                     # Housing.csv dataset
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Entry point to run backend server
│
└── frontend/                     # Vite + React Frontend
    ├── src/                      # UI Views, Tabs, and Charts
    ├── package.json              # NPM dependencies & scripts
    └── vite.config.js            # Port (5173) & Proxy configurations
```

---

## 🛠️ Getting Started (Local Development)

To run the application locally, you will need to start both the backend server and the frontend server.

### 🐍 Step 1: Run the Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   python3 run.py
   ```
   *The backend will automatically train the prediction model on `data/Housing.csv` 


### ⚛️ Step 2: Run the Frontend (Vite + React)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on http://localhost:5173/

## 🧪 Running Tests

To run the backend test suite:
```bash
cd backend
python3 app/tests.py
```

---

## 📦 Tech Stack

* **Frontend:** React (Vite, Tailwind CSS v3, Lucide Icons)
* **Backend:** FastAPI, Uvicorn, Python
* **Machine Learning:** Scikit-learn, Pandas, Numpy
* **Document Generation:** ReportLab (PDF)
