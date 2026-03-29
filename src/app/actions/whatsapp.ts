"use server";

import { getWhatsAppSettings } from "./whatsapp-settings";

const BRIDGE_URL = 'http://127.0.0.1:9005';

/**
 * Normalizes phone number to have 88 country code if missing (Bangladesh fallback)
 */
function normalizePhoneNumber(phoneNumber: string) {
    let clean = phoneNumber.replace(/\D/g, '');
    if (clean.length === 11 && clean.startsWith('01')) {
        clean = '88' + clean;
    }
    return clean;
}

/**
 * Checks if a number exists on WhatsApp using the private bridge.
 */
export async function checkWhatsAppAvailability(phoneNumber: string) {
    const settings = await getWhatsAppSettings();
    if (!settings.isEnabled) {
        return { success: false, error: "WhatsApp integration is currently disabled." };
    }

    const cleanNumber = normalizePhoneNumber(phoneNumber);

    try {
        const response = await fetch(`${BRIDGE_URL}/check-number`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: cleanNumber }),
            signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) return { success: false, error: "Private Bridge connection error" };
        
        const data = await response.json();
        return { success: true, exists: data.exists };
    } catch (err) {
        console.error("WhatsApp Availability Check Failed:", err);
        return { success: false, error: "Bridge unavailable. Please start the WhatsApp Engine." };
    }
}

/**
 * Sends a WhatsApp message via the private bridge.
 */
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
    const settings = await getWhatsAppSettings();
    if (!settings.isEnabled) return { success: false, error: "WhatsApp Disabled" };

    const cleanNumber = normalizePhoneNumber(phoneNumber);

    try {
        const response = await fetch(`${BRIDGE_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: cleanNumber, message }),
            signal: AbortSignal.timeout(30000),
        });
        
        if (!response.ok) return { success: false, error: "Bridge failed to deliver message" };
        return await response.json();
    } catch (err) {
        console.error("WhatsApp Send Failed:", err);
        return { success: false, error: "Engine connection failed. Ensure the bridge is running." };
    }
}
