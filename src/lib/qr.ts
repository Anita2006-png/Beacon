import QRCode from "qrcode";

/**
 * QR generation (BUILD_SPEC §5/§7).
 *
 * The QR encodes ONLY the emergency URL containing the opaque token — never
 * any PII. Scanning opens `https://<app>/e/<qr_token>`.
 */

export function emergencyUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${base}/e/${token}`;
}

/** Returns a PNG data URL for the token's emergency link. */
export async function qrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(emergencyUrl(token), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#134E4A", light: "#FFFFFF" }, // primary-900 on white
  });
}
