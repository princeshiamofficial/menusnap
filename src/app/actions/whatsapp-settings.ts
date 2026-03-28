
'use server';

import fs from 'fs/promises';
import path from 'path';

export interface WhatsAppSettings {
  isEnabled: boolean;
  instanceId?: string;
  apiToken?: string;
  host?: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), '.whatsapp-settings.json');

/**
 * Retrieves WhatsApp (Green API) settings from the JSON file.
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    // If the file doesn't exist, return default settings or values from env as fallback
    if (error.code === 'ENOENT') {
      return { 
        isEnabled: false, 
        instanceId: process.env.GREEN_API_INSTANCE_ID || '', 
        apiToken: process.env.GREEN_API_TOKEN || '',
        host: '7107.api.greenapi.com'
      };
    }
    console.error('Error reading WhatsApp settings:', error);
    throw new Error('Could not read settings file.');
  }
}

/**
 * Saves WhatsApp (Green API) settings to the JSON file.
 * @param settings The settings to save.
 */
export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  try {
    // Basic validation
    if (settings.isEnabled && (!settings.instanceId || !settings.apiToken)) {
      throw new Error("Instance ID and API Token are required when WhatsApp integration is enabled.");
    }
    const data = JSON.stringify(settings, null, 2);
    await fs.writeFile(SETTINGS_FILE_PATH, data, 'utf-8');
  } catch (error: any) {
    console.error('Error saving WhatsApp settings:', error);
    throw new Error(error.message || 'Could not save settings file.');
  }
}
