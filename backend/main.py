from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="Home Assistant API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock state
state = {
    "lights": False,
    "temperature": 22.5,
    "humidity": 45,
    "mode": "Home"
}

class ToggleRequest(BaseModel):
    device: str

class ModeRequest(BaseModel):
    mode: str

@app.get("/api/status")
async def get_status():
    return state

@app.post("/api/toggle")
async def toggle_device(request: ToggleRequest):
    if request.device == "lights":
        state["lights"] = not state["lights"]
    return {"status": "success", "lights": state["lights"]}

@app.post("/api/mode")
async def set_mode(request: ModeRequest):
    if request.mode in ["Home", "Away", "Night"]:
        state["mode"] = request.mode
    return {"status": "success", "mode": state["mode"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
