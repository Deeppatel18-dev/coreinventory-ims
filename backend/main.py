from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, SessionLocal
from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "Core Inventory API running"}

@app.post("/products")
def add_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@app.get("/products")
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginData):
    if data.email == "admin@gmail.com" and data.password == "1234":
        return {"status": "success", "message": "Login successful"}
    return {"status": "error", "message": "Invalid credentials"}