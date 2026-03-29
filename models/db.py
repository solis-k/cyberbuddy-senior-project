import sqlite3
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
    except sqlite3.OperationalError:
        # Column already exists
        pass

    # Chat history
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        bot_response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Quiz results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        total_questions INTEGER,
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Admin")

    if admin_username and admin_password:
        cursor.execute("SELECT * FROM users WHERE username=?", (admin_username,))
        existing_admin = cursor.fetchone()

        if not existing_admin:
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt()

            hashed_pw = bcrypt.generate_password_hash(admin_password).decode("utf-8")

            cursor.execute("""
                INSERT INTO users (username, password, name, role)
                VALUES (?, ?, ?, ?)
            """, (admin_username, hashed_pw, admin_name, "admin"))

            print("✅ Admin account created")

    conn.commit()
    conn.close()

    _ensure_chat_history_user_id()


def _ensure_chat_history_user_id():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(chat_history)")
    columns = [row[1] for row in cursor.fetchall()]

    if "user_id" not in columns:
        cursor.execute("ALTER TABLE chat_history ADD COLUMN user_id INTEGER")
        conn.commit()

    conn.close()


def save_chat(user_id, user_message, bot_response):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO chat_history (user_id, user_message, bot_response)
    VALUES (?, ?, ?)
    """, (user_id, user_message, bot_response))

    conn.commit()
    conn.close()


def get_recent_chats(user_id, limit=5):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT user_message, bot_response
    FROM chat_history
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT ?
    """, (user_id, limit))

    rows = cursor.fetchall()
    conn.close()

    return rows


def find_exact_reply(user_id, user_message):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT bot_response
    FROM chat_history
    WHERE user_id = ? AND user_message = ?
    ORDER BY id DESC
    LIMIT 1
    """, (user_id, user_message))

    row = cursor.fetchone()
    conn.close()

    return row[0] if row else None


def save_quiz_result(user_id, score, total_questions):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO quiz_results (user_id, score, total_questions)
    VALUES (?, ?, ?)
    """, (user_id, score, total_questions))

    conn.commit()
    conn.close()