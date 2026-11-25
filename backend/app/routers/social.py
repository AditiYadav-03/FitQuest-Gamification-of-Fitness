from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models.social import Post, Like, Comment, Friendship, Follow
from app.models.user import User, UserProfile
from app.models.activity import Activity
from app.schemas.social import (
    PostCreate,
    PostResponse,
    CommentCreate,
    CommentResponse,
    PostActivitySnippet,
    FriendRequestCreate,
    FriendshipResponse
)
from app.services.notification_service import create_notification
from app.dependencies import get_current_user

router = APIRouter(prefix="/social", tags=["Social Community"])

@router.get("/feed", response_model=List[PostResponse])
def get_feed(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts = (
        db.query(Post)
        .order_by(desc(Post.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    user_liked_ids = {
        l.post_id for l in db.query(Like).filter(Like.user_id == current_user.id).all()
    }

    results = []
    for p in posts:
        author = p.user
        author_profile = author.profile if author else None

        # Build activity snippet if attached
        act_snippet = None
        if p.activity:
            act_snippet = PostActivitySnippet(
                id=p.activity.id,
                activity_type=p.activity.activity_type,
                title=p.activity.title,
                duration_minutes=p.activity.duration_minutes,
                distance_km=p.activity.distance_km,
                calories_burned=p.activity.calories_burned,
                xp_earned=p.activity.xp_earned
            )

        comments_list = []
        for c in p.comments:
            c_author = c.user
            c_profile = c_author.profile if c_author else None
            comments_list.append(CommentResponse(
                id=c.id,
                post_id=c.post_id,
                user_id=c.user_id,
                username=c_author.username if c_author else "unknown",
                full_name=c_author.full_name if c_author else "Unknown",
                avatar_url=c_profile.avatar_url if c_profile else None,
                content=c.content,
                created_at=c.created_at
            ))

        results.append(PostResponse(
            id=p.id,
            user_id=p.user_id,
            username=author.username if author else "unknown",
            full_name=author.full_name if author else "Unknown",
            avatar_url=author_profile.avatar_url if author_profile else None,
            level=author_profile.level if author_profile else 1,
            content=p.content,
            activity=act_snippet,
            likes_count=p.likes_count,
            comments_count=p.comments_count,
            is_liked=p.id in user_liked_ids,
            created_at=p.created_at,
            comments=comments_list
        ))

    return results

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    req: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.activity_id:
        act = db.query(Activity).filter(Activity.id == req.activity_id, Activity.user_id == current_user.id).first()
        if not act:
            raise HTTPException(status_code=400, detail="Activity not found or not owned by you.")

    post = Post(
        user_id=current_user.id,
        activity_id=req.activity_id,
        content=req.content,
        likes_count=0,
        comments_count=0
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    profile = current_user.profile
    act_snippet = None
    if post.activity:
        act_snippet = PostActivitySnippet(
            id=post.activity.id,
            activity_type=post.activity.activity_type,
            title=post.activity.title,
            duration_minutes=post.activity.duration_minutes,
            distance_km=post.activity.distance_km,
            calories_burned=post.activity.calories_burned,
            xp_earned=post.activity.xp_earned
        )

    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=profile.avatar_url if profile else None,
        level=profile.level if profile else 1,
        content=post.content,
        activity=act_snippet,
        likes_count=0,
        comments_count=0,
        is_liked=False,
        created_at=post.created_at,
        comments=[]
    )

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this post.")

    db.delete(post)
    db.commit()
    return None

@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    existing_like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": post.likes_count}
    else:
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1

        # Notify post owner if not self
        if post.user_id != current_user.id:
            create_notification(
                db=db,
                user_id=post.user_id,
                type="like",
                title=f"{current_user.username} liked your post!",
                message=f"{current_user.full_name} gave kudos to your workout post.",
                link="/community"
            )

        db.commit()
        return {"liked": True, "likes_count": post.likes_count}

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def add_comment(
    post_id: int,
    req: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=req.content
    )
    db.add(comment)
    post.comments_count += 1

    if post.user_id != current_user.id:
        create_notification(
            db=db,
            user_id=post.user_id,
            type="comment",
            title=f"{current_user.username} commented on your post!",
            message=f"{current_user.full_name}: \"{req.content[:60]}...\"",
            link="/community"
        )

    db.commit()
    db.refresh(comment)

    profile = current_user.profile
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=profile.avatar_url if profile else None,
        content=comment.content,
        created_at=comment.created_at
    )

# Friendships
@router.get("/friends", response_model=List[FriendshipResponse])
def get_friends_and_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendships = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user.id,
            Friendship.addressee_id == current_user.id
        )
    ).all()

    results = []
    for f in friendships:
        is_requester = f.requester_id == current_user.id
        partner = f.addressee if is_requester else f.requester
        if not partner:
            continue
        p_profile = partner.profile

        results.append(FriendshipResponse(
            id=f.id,
            requester_id=f.requester_id,
            addressee_id=f.addressee_id,
            status=f.status,
            created_at=f.created_at,
            partner_id=partner.id,
            partner_username=partner.username,
            partner_full_name=partner.full_name,
            partner_avatar=p_profile.avatar_url if p_profile else None,
            partner_level=p_profile.level if p_profile else 1
        ))

    return results

@router.post("/friends/request")
def send_friend_request(
    req: FriendRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself.")

    target = db.query(User).filter(User.id == req.target_user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found.")

    existing = db.query(Friendship).filter(
        or_(
            (Friendship.requester_id == current_user.id) & (Friendship.addressee_id == req.target_user_id),
            (Friendship.requester_id == req.target_user_id) & (Friendship.addressee_id == current_user.id)
        )
    ).first()

    if existing:
        if existing.status == "accepted":
            return {"message": "You are already friends!"}
        elif existing.status == "pending":
            return {"message": "A friend request is already pending."}

    fs = Friendship(
        requester_id=current_user.id,
        addressee_id=req.target_user_id,
        status="pending"
    )
    db.add(fs)

    create_notification(
        db=db,
        user_id=req.target_user_id,
        type="friend_request",
        title=f"New Friend Request from {current_user.username}!",
        message=f"{current_user.full_name} wants to connect with you on FitQuest.",
        link="/community"
    )

    db.commit()
    return {"message": "Friend request sent successfully!"}

@router.post("/friends/{request_id}/respond")
def respond_friend_request(
    request_id: int,
    action: str = "accept",  # "accept" or "reject"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fs = db.query(Friendship).filter(Friendship.id == request_id).first()
    if not fs:
        raise HTTPException(status_code=404, detail="Friend request not found.")

    if fs.addressee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only respond to requests sent to you.")

    if action == "accept":
        fs.status = "accepted"
        create_notification(
            db=db,
            user_id=fs.requester_id,
            type="friend_accepted",
            title=f"{current_user.username} accepted your friend request! 🎉",
            message=f"You and {current_user.full_name} are now fitness friends. You can view each other on the Friends Leaderboard!",
            link="/leaderboard"
        )
        db.commit()
        return {"message": "Friend request accepted!"}
    else:
        db.delete(fs)
        db.commit()
        return {"message": "Friend request declined."}

@router.post("/follow/{user_id}")
def toggle_follow(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself.")

    follow = db.query(Follow).filter(Follow.follower_id == current_user.id, Follow.followed_id == user_id).first()
    if follow:
        db.delete(follow)
        db.commit()
        return {"following": False, "message": "Unfollowed user."}
    else:
        new_follow = Follow(follower_id=current_user.id, followed_id=user_id)
        db.add(new_follow)
        target = db.query(User).filter(User.id == user_id).first()
        if target:
            create_notification(
                db=db,
                user_id=user_id,
                type="new_follower",
                title=f"{current_user.username} is now following you!",
                message=f"{current_user.full_name} started following your fitness updates.",
                link=f"/profile/{current_user.id}"
            )
        db.commit()
        return {"following": True, "message": "Now following user!"}
