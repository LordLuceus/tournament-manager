import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SHARED_TOURNAMENTS_DIR = path.join(process.cwd(), 'shared-tournaments');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const params = await context.params;
    const { shareId } = params;
    
    if (!shareId || typeof shareId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid share ID' },
        { status: 400 }
      );
    }

    const filePath = path.join(SHARED_TOURNAMENTS_DIR, `${shareId}.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const tournament = JSON.parse(fileContent);
      
      // Verify this is a public tournament with the correct share ID
      if (!tournament.isPublic || tournament.shareId !== shareId) {
        return NextResponse.json(
          { error: 'Tournament not found or not public' },
          { status: 404 }
        );
      }

      return NextResponse.json(tournament);
    } catch {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving shared tournament:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tournament' },
      { status: 500 }
    );
  }
}