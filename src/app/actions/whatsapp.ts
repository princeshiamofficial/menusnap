
"use server";

export async function checkWhatsAppAvailability(phoneNumber: string) {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) {
    console.error("Green API credentials are missing in .env.local");
    return { success: false, error: "Configuration Error" };
  }

  // Clean the number and ensure it has the country code
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  if (cleanNumber.length === 11 && cleanNumber.startsWith('01')) {
    cleanNumber = '88' + cleanNumber;
  }

  try {
    const url = `https://7107.api.greenapi.com/waInstance${instanceId}/checkWhatsapp/${apiToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: cleanNumber }),
      // Adding a small timeout to avoid hangs
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Green API Error:", errorData);
        return { success: false, error: "Service Error" };
    }

    const data = await response.json();
    return { success: true, exists: data.existsWhatsapp };
  } catch (error) {
    console.error("WhatsApp Check Failed:", error);
    return { success: false, error: "Network Error" };
  }
}
