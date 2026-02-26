import sqlite3

def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        bot_response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


def save_chat(user_message, bot_response):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO chat_history (user_message, bot_response)
    VALUES (?, ?)
    """, (user_message, bot_response))

    conn.commit()
    conn.close()

def find_exact_reply(user_message):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT bot_response
        FROM chat_history
        WHERE user_message = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user_message,))

    row = cursor.fetchone()
    conn.close()

    return row[0] if row else None