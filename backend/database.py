import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models import Base

_raw_url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://retro:retro@localhost:5432/retro")
# Railway provides postgres:// but SQLAlchemy needs postgresql+psycopg2://
DATABASE_URL = _raw_url.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)

def create_tables():
    Base.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session