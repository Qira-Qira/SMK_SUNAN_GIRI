import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    const nodeEnv = process.env.NODE_ENV;

    // Check if DATABASE_URL contains the ampersand
    const hasAmpersand = databaseUrl?.includes('&') || false;
    const hasPercentEncoded = databaseUrl?.includes('%26') || false;

    return NextResponse.json({
      status: 'ok',
      environment: nodeEnv,
      env_vars: {
        DATABASE_URL_exists: !!databaseUrl,
        DATABASE_URL_length: databaseUrl?.length || 0,
        DATABASE_URL_has_ampersand: hasAmpersand,
        DATABASE_URL_has_percent_encoded: hasPercentEncoded,
        DATABASE_URL_sample: databaseUrl ? databaseUrl.substring(0, 80) + '...' : 'NOT SET',
        DIRECT_URL_exists: !!directUrl,
        DIRECT_URL_sample: directUrl ? directUrl.substring(0, 80) + '...' : 'NOT SET',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
