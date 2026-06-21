import os
import sys
import uvicorn

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    print("Starting EstateGPT Elite Backend Server...")
    # Run FastAPI app on port 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
