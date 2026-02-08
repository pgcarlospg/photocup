from app.db.session import SessionLocal
from app.models.photo import Score, Photo
from app.models.user import User

db = SessionLocal()
scores_count = db.query(Score).count()
photos_count = db.query(Photo).count()
users_count = db.query(User).count()

print(f"Total Users: {users_count}")
print(f"Total Photos: {photos_count}")
print(f"Total Scores: {scores_count}")

all_scores = db.query(Score).all()
for s in all_scores:
    print(f"Score ID: {s.id}, Photo: {s.photo_id}, Judge: {s.judge_id}, Total: {s.total_score}")

db.close()
