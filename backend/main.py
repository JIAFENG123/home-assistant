from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, init_db, Family, Item as DBItem, Note as DBNote

app = FastAPI(title="Home Assistant API")

# Initialize Database
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FamilyLogin(BaseModel):
    name: str


class Item(BaseModel):
    name: str
    quantity: float
    unit: str
    location: str
    category: str

class ItemUpdate(BaseModel):
    quantity: Optional[float] = None

class NoteBase(BaseModel):
    content: str

class NoteOut(NoteBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Helper to get current family context
def get_current_family(x_family_name: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not x_family_name:
        raise HTTPException(status_code=400, detail="X-Family-Name header required")
    family = db.query(Family).filter(Family.name == x_family_name).first()
    if not family:
        family = Family(name=x_family_name)
        db.add(family)
        db.commit()
        db.refresh(family)
    return family

@app.post("/api/login")
async def login(login_data: FamilyLogin, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.name == login_data.name).first()
    if not family:
        family = Family(name=login_data.name)
        db.add(family)
        db.commit()
    return {"status": "success", "family": family.name}

@app.get("/api/status")
async def get_status(family: Family = Depends(get_current_family)):
    return {
        "status": "online",
        "family": family.name
    }


# Inventory Endpoints
@app.get("/api/items")
async def get_items(family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    return db.query(DBItem).filter(DBItem.family_name == family.name).all()

@app.post("/api/items")
async def add_item(item: Item, family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    new_item = DBItem(
        id=str(uuid.uuid4()),
        name=item.name,
        quantity=item.quantity,
        unit=item.unit,
        location=item.location,
        category=item.category,
        family_name=family.name
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str, family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    item = db.query(DBItem).filter(DBItem.id == item_id, DBItem.family_name == family.name).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"status": "success"}

@app.patch("/api/items/{item_id}")
async def update_item(item_id: str, update: ItemUpdate, family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    item = db.query(DBItem).filter(DBItem.id == item_id, DBItem.family_name == family.name).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if update.quantity is not None:
        item.quantity = update.quantity
    
    db.commit()
    db.refresh(item)
    return item

# Notes Endpoints
@app.get("/api/notes", response_model=List[NoteOut])
async def get_notes(family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    return db.query(DBNote).filter(DBNote.family_name == family.name).order_by(DBNote.created_at.desc()).all()

@app.post("/api/notes", response_model=NoteOut)
async def add_note(note: NoteBase, family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    new_note = DBNote(
        id=str(uuid.uuid4()),
        content=note.content,
        family_name=family.name
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: str, family: Family = Depends(get_current_family), db: Session = Depends(get_db)):
    note = db.query(DBNote).filter(DBNote.id == note_id, DBNote.family_name == family.name).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
