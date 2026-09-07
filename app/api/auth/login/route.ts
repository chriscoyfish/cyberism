import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const cleanUsername = username.trim().toLowerCase();

    const result = await db.execute({
      sql: 'SELECT id, username, password_hash FROM users WHERE LOWER(username) = ?',
      args: [cleanUsername],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Operative handle not found' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(
      password,
      user.password_hash as string
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid security cipher credentials' },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id as string,
      username: user.username as string,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
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
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
