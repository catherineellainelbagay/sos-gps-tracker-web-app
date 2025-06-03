import sqlite3

conn = sqlite3.connect('database.db')
conn.execute('ALTER TABLE emergency ADD COLUMN is_acknowledged INTEGER DEFAULT 0')
conn.commit()
conn.close()

print("Column added.")
