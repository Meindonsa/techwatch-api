import { db } from '../db/index.js'
import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password)
}

export interface User {
    id: number
    username: string
    password: string
    created_at: string
}

export async function createUser(username: string, password: string): Promise<User> {
    const hashed = await hashPassword(password)
    const stmt = db.prepare(`
    INSERT INTO users (username, password) VALUES (?, ?) RETURNING *
  `)
    return stmt.get(username, hashed) as User
}

export function getUserById(id: number): User | undefined {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined
}

export function getUserByUsername(username: string): User | undefined {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as User | undefined
}

export function usernameExists(username: string): boolean {
    const row = db.prepare(`SELECT 1 FROM users WHERE username = ?`).get(username)
    return row !== undefined
}

export function getAllUsers(): User[] {
    return db.prepare(`SELECT * FROM users`).all() as User[]
}