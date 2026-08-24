import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventSourceUrl, customData, userData, eventId } = body;

    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      return NextResponse.json(
        { error: 'Meta Pixel ID or Access Token is missing from environment variables.' },
        { status: 500 }
      );
    }

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required.' },
        { status: 400 }
      );
    }

    // Extract client IP and User Agent from request headers
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const clientUserAgent = request.headers.get('user-agent') || '';

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || undefined,
          event_source_url: eventSourceUrl || request.headers.get('referer') || '',
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: clientUserAgent,
            ...userData,
          },
          custom_data: customData || {},
        },
      ],
    };

    const graphApiUrl = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI Error:', result);
      return NextResponse.json(
        { error: 'Failed to send event to Meta Conversions API', details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Error handling Meta CAPI route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
