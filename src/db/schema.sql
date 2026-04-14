CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('rss', 'atom')),
    feed_url TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, feed_id)
);

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    pub_date TEXT,
    summary TEXT,
    author TEXT,
    image TEXT,
    feed_id INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    fetched_at TEXT DEFAULT (datetime('now'))
);