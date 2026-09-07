import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const result = await db.execute({
      sql: `
        SELECT id, slot_number, title, summary, character_data, messages, turn_count, updated_at
        FROM saves
        WHERE user_id = ?
        ORDER BY slot_number ASC, updated_at DESC
      `,
      args: [user.userId],
    });

    const saves = result.rows.map((row) => ({
      id: row.id,
      slotNumber: row.slot_number,
      title: row.title,
      summary: row.summary,
      characterData: row.character_data ? JSON.parse(row.character_data as string) : null,
      messages: row.messages ? JSON.parse(row.messages as string) : [],
      turnCount: row.turn_count,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ saves });
  } catch (err: unknown) {
    console.error('Fetch saves error:', err);
    return NextResponse.json({ error: 'Failed to retrieve save states' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      slotNumber = 1,
      title = 'Night City Chronicle',
      summary = '',
      characterData = {},
      messages = [],
      turnCount = 0,
    } = await req.json();

    const db = getDb();
    const saveId = `save_${user.userId}_slot_${slotNumber}`;
    const now = Date.now();

    const messagesJson = JSON.stringify(messages);
    const characterDataJson = JSON.stringify(characterData);

    // Upsert save slot
    await db.execute({
      sql: `
        INSERT INTO saves (id, user_id, slot_number, title, summary, character_data, messages, turn_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          summary = excluded.summary,
          character_data = excluded.character_data,
          messages = excluded.messages,
          turn_count = excluded.turn_count,
          updated_at = excluded.updated_at
      `,
      args: [
        saveId,
        user.userId,
        slotNumber,
        title,
        summary,
        characterDataJson,
        messagesJson,
        turnCount,
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      saveId,
      updatedAt: now,
    });
  } catch (err: unknown) {
    console.error('Save state error:', err);
    return NextResponse.json({ error: 'Failed to persist game state' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotNumber = parseInt(searchParams.get('slot') || '1', 10);

    const db = getDb();
    const saveId = `save_${user.userId}_slot_${slotNumber}`;

    await db.execute({
      sql: 'DELETE FROM saves WHERE id = ? AND user_id = ?',
      args: [saveId, user.userId],
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Delete save error:', err);
    return NextResponse.json({ error: 'Failed to delete save slot' }, { status: 500 });
  }
}
