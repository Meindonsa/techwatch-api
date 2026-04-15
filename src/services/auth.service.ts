import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'changeme_secret')
const EXPIRATION = process.env.JWT_EXPIRATION ?? '7d'

export interface JWTPayload {
    userId: number
    username: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(EXPIRATION)
        .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
}