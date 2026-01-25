import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'vocab-session.log');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const timestamp = new Date().toISOString();
    const logLine = JSON.stringify({ timestamp, ...data }) + '\n';

    fs.appendFileSync(LOG_FILE, logLine);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new NextResponse('No logs yet', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    return new NextResponse('Error reading logs', { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
