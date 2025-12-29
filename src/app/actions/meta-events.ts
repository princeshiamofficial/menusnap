
'use server';

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface MetaPixelSettings {
  isEnabled: boolean;
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
}

// Use a file in a writable directory. In a real deployed environment,
// you might use a more robust storage solution like a database or a proper config service.
const SETTINGS_FILE_PATH = path.join(process.cwd(), '.meta-pixel-settings.json');

/**
 * Retrieves Meta Pixel settings from the JSON file.
 */
export async function getMetaPixelSettings(): Promise<MetaPixelSettings> {
  try {
    const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    // If the file doesn't exist, return default settings
    if (error.code === 'ENOENT') {
      return { isEnabled: false, pixelId: '', accessToken: '', testEventCode: '' };
    }
    console.error('Error reading Meta Pixel settings:', error);
    throw new Error('Could not read settings file.');
  }
}

/**
 * Saves Meta Pixel settings to the JSON file.
 * @param settings The settings to save.
 */
export async function saveMetaPixelSettings(settings: MetaPixelSettings): Promise<void> {
  try {
    // Basic validation
    if (settings.isEnabled && (!settings.pixelId || !settings.accessToken)) {
      throw new Error("Pixel ID and Access Token are required when tracking is enabled.");
    }
    const data = JSON.stringify(settings, null, 2);
    await fs.writeFile(SETTINGS_FILE_PATH, data, 'utf-8');
  } catch (error: any) {
    console.error('Error saving Meta Pixel settings:', error);
    throw new Error(error.message || 'Could not save settings file.');
  }
}

/**
 * Sends a server-side event to the Meta Conversions API.
 * This should be called from server-side logic or other Server Actions.
 *
 * @param eventName The name of the event (e.g., 'PageView', 'Purchase').
 * @param eventData Custom data associated with the event.
 */
export async function sendServerEvent(
  eventName: string,
  eventData: Record<string, any>
) {
  const settings = await getMetaPixelSettings();

  if (!settings.isEnabled || !settings.pixelId || !settings.accessToken) {
    // Silently fail if tracking is disabled or not configured
    console.log('Meta Pixel server-side tracking is disabled or not configured.');
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${settings.pixelId}/events`;

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
    access_token: settings.accessToken,
    ...(settings.testEventCode && { test_event_code: settings.testEventCode }),
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
