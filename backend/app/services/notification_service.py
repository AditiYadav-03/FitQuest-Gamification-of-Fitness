from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    link: str = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
        is_read=False
    )
    db.add(notif)
    db.flush()
    return notif
