import sqlite3

conn = sqlite3.connect("nutrican_project.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM Athlete LIMIT 5;")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
