'use server';

import { randomUUID } from 'crypto';

/**
 * Sends a server-side event to the Meta Conversions API.
 * This should be called from server-side logic or other Server Actions.
 *
 * @param eventName The name of the event (e.g., 'PageView', 'Purchase').
 * @param eventData Custom data associated with the event.
 * @param testEventCode Optional test code from Meta's Events Manager to validate events.
 */
export async function sendServerEvent(
  eventName: string,
  eventData: Record<string, any>,
  testEventCode?: string
) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_PIXEL_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.error('Meta Pixel ID or Access Token is not configured in environment variables.');
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: randomUUID(), // Generate a unique ID for deduplication
        ...eventData,
      },
    ],
    access_token: accessToken,
    ...(testEventCode && { test_event_code: testEventCode }), // Add test code if provided
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error('Meta Conversions API error:', responseBody);
      throw new Error(responseBody.error?.message || 'Failed to send server event.');
    }

    console.log('Server event sent successfully to Meta:', responseBody);
    return responseBody;
  } catch (error) {
    console.error('Error sending server event:', error);
    // In a real app, you might want more robust error handling or logging.
  }
}
