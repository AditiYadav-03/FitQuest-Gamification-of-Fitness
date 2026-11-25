import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    activity_type = Column(String(50), nullable=False, index=True)  # running, walking, cycling, gym, swimming, yoga, hiit, sports
    title = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    distance_km = Column(Float, default=0.0)
    calories_burned = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    coins_earned = Column(Integer, default=0)
    intensity = Column(String(20), default="medium")  # low, medium, high
    activity_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activities")
    posts = relationship("Post", back_populates="activity")
