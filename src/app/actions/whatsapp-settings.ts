'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Interface for WhatsApp Private Bridge settings.
 * Now exclusively using the self-hosted Baileys bridge.
 */
export interface WhatsAppSettings {
  isEnabled: boolean;
  isGreetingEnabled: boolean;
  greetingMessage: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), '.whatsapp-settings.json');

/**
 * Retrieves WhatsApp connection settings.
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { 
        isEnabled: false,
        isGreetingEnabled: false,
        greetingMessage: "Hello! Welcome to our business. How can we help you today?"
      };
    }
    console.error('Error reading WhatsApp settings:', error);
    return { 
      isEnabled: false,
      isGreetingEnabled: false,
      greetingMessage: "" 
    };
  }
}

/**
 * Saves WhatsApp connection settings.
 */
export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  try {
    const data = JSON.stringify(settings, null, 2);
    await fs.writeFile(SETTINGS_FILE_PATH, data, 'utf-8');
  } catch (error: any) {
    console.error('Error saving WhatsApp settings:', error);
    throw new Error('Could not save WhatsApp settings.');
  }
}
