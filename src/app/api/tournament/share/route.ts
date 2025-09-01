import { Tournament } from "@/types/tournament";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const SHARED_TOURNAMENTS_DIR = path.join(process.cwd(), "shared-tournaments");

// Ensure the shared tournaments directory exists
async function ensureSharedTournamentsDir() {
  try {
    await fs.access(SHARED_TOURNAMENTS_DIR);
  } catch {
    await fs.mkdir(SHARED_TOURNAMENTS_DIR, { recursive: true });
  }
}

// Find existing share by tournament ID
async function findExistingShare(
  tournamentId: string
): Promise<{ shareId: string } | null> {
  try {
    const files = await fs.readdir(SHARED_TOURNAMENTS_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    for (const file of jsonFiles) {
      const filePath = path.join(SHARED_TOURNAMENTS_DIR, file);
      const content = await fs.readFile(filePath, "utf-8");
      const sharedTournament: Tournament = JSON.parse(content);

      if (sharedTournament.id === tournamentId && sharedTournament.shareId) {
        return { shareId: sharedTournament.shareId };
      }
    }

    return null;
  } catch (error) {
    console.error("Error checking for existing shares:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const tournament: Tournament = await request.json();

    if (!tournament || !tournament.id) {
      return NextResponse.json(
        { error: "Invalid tournament data" },
        { status: 400 }
      );
    }

    // Ensure directory exists
    await ensureSharedTournamentsDir();

    // Check if tournament is already shared
    const existingShare = await findExistingShare(tournament.id);
    if (existingShare) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json({
        success: true,
        shareId: existingShare.shareId,
        shareUrl: `${baseUrl}/tournament/${existingShare.shareId}`,
        alreadyShared: true,
      });
    }

    // Generate a unique share ID
    const shareId = uuidv4();

    // Prepare tournament for sharing (mark as public and add share ID)
    const sharedTournament: Tournament = {
      ...tournament,
      isPublic: true,
      shareId,
    };

    // Save tournament to file system
    const filePath = path.join(SHARED_TOURNAMENTS_DIR, `${shareId}.json`);
    await fs.writeFile(filePath, JSON.stringify(sharedTournament, null, 2));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl: `${baseUrl}/tournament/${shareId}`,
      alreadyShared: false,
    });
  } catch (error) {
    console.error("Error sharing tournament:", error);
    return NextResponse.json(
      { error: "Failed to share tournament" },
      { status: 500 }
    );
  }
}
