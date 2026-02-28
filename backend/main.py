from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI(title="Home Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initial State
state = {
    "lights": False,
    "temperature": 24.2,
    "humidity": 42,
    "mode": "Home"
}

# Inventory State
items = [
    {"id": str(uuid.uuid4()), "name": "Milk", "quantity": 2, "unit": "L", "location": "Fridge", "category": "Grocery"},
    {"id": str(uuid.uuid4()), "name": "Batteries AA", "quantity": 12, "unit": "pcs", "location": "Drawer", "category": "Electronics"},
    {"id": str(uuid.uuid4()), "name": "Rice", "quantity": 5, "unit": "kg", "location": "Pantry", "category": "Grocery"},
]

class ToggleRequest(BaseModel):
    device: str

class ModeRequest(BaseModel):
    mode: str

class Item(BaseModel):
    name: str
    quantity: float
    unit: str
    location: str
    category: str

class ItemUpdate(BaseModel):
    quantity: Optional[float] = None

@app.get("/api/status")
async def get_status():
    # In a real app, this would fetch from actual sensors
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

# Inventory Endpoints
@app.get("/api/items")
async def get_items():
    return items

@app.post("/api/items")
async def add_item(item: Item):
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    items.append(new_item)
    return new_item

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    global items
    items = [i for i in items if i["id"] != item_id]
    return {"status": "success"}

@app.patch("/api/items/{item_id}")
async def update_item(item_id: str, update: ItemUpdate):
    for item in items:
        if item["id"] == item_id:
            if update.quantity is not None:
                item["quantity"] = update.quantity
            return item
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
