import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List
from jose import jwt, JWTError

from app.database import SessionLocal, engine
from app.models import Base, Item

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
ALGORITHM = "HS256"
security = HTTPBearer()
app = FastAPI()


# Dependency: get a new DB session per request
async def get_db():
    async with SessionLocal() as session:
        yield session


# Pydantic schemas
class ItemCreate(BaseModel):
    name: str
    description: str


class ItemRead(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        orm_mode = True


# Create DB tables (only for testing or development)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get('/')
def hello():
    return "Hellow world"


@app.post("/items/", response_model=ItemRead)
async def create_item(item: ItemCreate, db: AsyncSession = Depends(get_db)):
    new_item = Item(name=item.name, description=item.description)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item


@app.get("/items/", response_model=List[ItemRead])
async def read_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item))
    return result.scalars().all()


def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt(token)
    return payload  # or fetch user from Django DB by `user_id` in payload


@app.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {"message": "Hello", "user": user}
