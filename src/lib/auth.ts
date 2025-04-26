import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

export interface TokenPayload {
    userId: string;
    email: string;
    papel: string;
}

export function generateToken(payload: TokenPayload): string {
    return sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = verify(token, JWT_SECRET);
        if (typeof decoded === 'string') {
            return null;
        }
        return decoded as TokenPayload;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return null;
    }
}

export async function getTokenFromCookies(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}

export async function getUserFromToken(): Promise<TokenPayload | null> {
    const token = await getTokenFromCookies();
    if (!token) return null;
    return verifyToken(token);
}

export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
} 