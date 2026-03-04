// WhatsApp integration DISABLED - placeholder stubs

export async function initializeWhatsAppClient() {
  return { success: false, message: "WhatsApp desativado" };
}

export async function sendWhatsAppMessage(phoneNumber: string, text: string) {
  console.log("[WhatsApp] DISABLED - would send to:", phoneNumber);
  return { success: false, error: "WhatsApp desativado" };
}

export async function sendWhatsAppMentionMessage(groupId: string, text: string, mentions: string[]) {
  return { success: false, error: "WhatsApp desativado" };
}

export async function sendGotReminder(groupId: string, message: string) {
  return { success: false, error: "WhatsApp desativado" };
}

export function getWhatsAppStatus() {
  return { connected: false, qrCode: null };
}

export async function disconnectWhatsApp() {
  return { success: true };
}

export async function clearWhatsAppSession() {
  return { success: true };
}

export function getCurrentQRCode() {
  return null;
}
