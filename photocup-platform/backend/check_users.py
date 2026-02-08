import sqlite3
import os

db_path = r"c:\Users\pgcar\Documents\Experimentos\Photocup\photocup-platform\backend\photocup.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM users;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()
else:
    print("DB not found")
