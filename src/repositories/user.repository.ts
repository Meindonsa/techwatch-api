import { db } from '../db/index.js'

export interface User {
    id: number
    username: string
    created_at: string
}

export function createUser(username: string): User {
    const stmt = db.prepare(`INSERT INTO users (username) VALUES (?) RETURNING *`)
    return stmt.get(username) as User
}

export function getUserById(id: number): User | undefined {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined
}

export function getUserByUsername(username: string): User | undefined {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as User | undefined
}

export function getAllUsers(): User[] {
    return db.prepare(`SELECT * FROM users`).all() as User[]
}