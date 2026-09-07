import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    const db = getDb();
    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE LOWER(username) = ?',
      args: [cleanUsername],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Operative handle already registered in Night City database' },
        { status: 409 }
      );
    }

    const userId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    await db.execute({
      sql: 'INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)',
      args: [userId, cleanUsername, passwordHash, now],
    });

    const token = await createToken({ userId, username: cleanUsername });

    const response = NextResponse.json({
      success: true,
      user: { id: userId, username: cleanUsername },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: unknown) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Failed to create user operative profile' },
      { status: 500 }
    );
  }
}
