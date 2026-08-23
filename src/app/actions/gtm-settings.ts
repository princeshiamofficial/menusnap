'use server';

import fs from 'fs/promises';
import path from 'path';

export interface GtmSettings {
  isEnabled: boolean;
  gtmId?: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), '.gtm-settings.json');

/**
 * Retrieves Google Tag Manager settings from the JSON file.
 */
export async function getGtmSettings(): Promise<GtmSettings> {
  try {
    const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    // If the file doesn't exist, return default settings
    if (error.code === 'ENOENT') {
      return { isEnabled: true, gtmId: 'GTM-MXJ6F2W2' };
    }
    console.error('Error reading GTM settings:', error);
    throw new Error('Could not read GTM settings file.');
  }
}

/**
 * Saves Google Tag Manager settings to the JSON file.
 * @param settings The settings to save.
 */
export async function saveGtmSettings(settings: GtmSettings): Promise<void> {
  try {
    if (settings.isEnabled && !settings.gtmId) {
      throw new Error("GTM Container ID is required when tracking is enabled.");
    }
    const data = JSON.stringify(settings, null, 2);
    await fs.writeFile(SETTINGS_FILE_PATH, data, 'utf-8');
  } catch (error: any) {
    console.error('Error saving GTM settings:', error);
    throw new Error(error.message || 'Could not save GTM settings file.');
  }
}
