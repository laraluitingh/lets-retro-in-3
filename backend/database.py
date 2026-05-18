from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models import Base

DATABASE_URL = "postgresql+psycopg2://retro:retro@localhost:5432/retro"

engine = create_engine(DATABASE_URL)

def create_tables():
    Base.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session