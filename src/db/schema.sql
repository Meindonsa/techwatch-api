CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT ( datetime ('now'))
);

CREATE TABLE IF NOT EXISTS feeds(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime ('now'))
);

CREATE TABLE IF NOT EXISTS user_feeds(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES
    users (id) ON DELETE CASCADE,
    feed_id INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT(datetime('now')),
    UNIQUE( user_id,feed_id)
);

CREATE TABLE IF NOT EXISTS articles(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER NOT NULL REFERENCES
    feeds (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    description TEXT,
    author TEXT,
    image TEXT,
    published_at TEXT,
    fetched_at TEXT DEFAULT(datetime('now'))
);