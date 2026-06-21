import os
import sys

# Add the app directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import get_db_context
from app.models.user import User

def main():
    try:
        with get_db_context() as db:
            users = db.query(User).all()
            print(f"Found {len(users)} users:")
            for u in users:
                print(f"- ID: {u.clerk_user_id}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
