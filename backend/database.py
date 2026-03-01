from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./home_assistant.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Family(Base):
    __tablename__ = "families"

    name = Column(String, primary_key=True, index=True)
    lights = Column(Boolean, default=False)
    temperature = Column(Float, default=24.0)
    humidity = Column(Float, default=45.0)
    mode = Column(String, default="Home")

    items = relationship("Item", back_populates="family")

class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Float, default=1.0)
    unit = Column(String, default="pcs")
    location = Column(String)
    category = Column(String)
    family_name = Column(String, ForeignKey("families.name"))

    family = relationship("Family", back_populates="items")

def init_db():
    Base.metadata.create_all(bind=engine)
