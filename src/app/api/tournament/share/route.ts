import { NextRequest, NextResponse } from 'next/server';
import { Tournament } from '@/types/tournament';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const SHARED_TOURNAMENTS_DIR = path.join(process.cwd(), 'shared-tournaments');

// Ensure the shared tournaments directory exists
async function ensureSharedTournamentsDir() {
  try {
    await fs.access(SHARED_TOURNAMENTS_DIR);
  } catch {
    await fs.mkdir(SHARED_TOURNAMENTS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tournament: Tournament = await request.json();
    
    if (!tournament || !tournament.id) {
      return NextResponse.json(
        { error: 'Invalid tournament data' },
        { status: 400 }
      );
    }

    // Generate a unique share ID
    const shareId = uuidv4();
    
    // Prepare tournament for sharing (mark as public and add share ID)
    const sharedTournament: Tournament = {
      ...tournament,
      isPublic: true,
      shareId,
    };

    // Ensure directory exists
    await ensureSharedTournamentsDir();

    // Save tournament to file system
    const filePath = path.join(SHARED_TOURNAMENTS_DIR, `${shareId}.json`);
    await fs.writeFile(filePath, JSON.stringify(sharedTournament, null, 2));

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl: `${request.nextUrl.origin}/tournament/${shareId}`
    });
  } catch (error) {
    console.error('Error sharing tournament:', error);
    return NextResponse.json(
      { error: 'Failed to share tournament' },
      { status: 500 }
    );
  }
}