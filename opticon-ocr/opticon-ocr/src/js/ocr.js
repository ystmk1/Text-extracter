/**
 * Google Cloud Vision API wrapper.
 * Uses DOCUMENT_TEXT_DETECTION for higher-fidelity output than plain TEXT_DETECTION.
 */

const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Run OCR on a single base64-encoded image.
 *
 * @param {string} base64 - Image bytes as base64 (no data URL prefix).
 * @param {string} apiKey - Google Cloud API key.
 * @param {string} langHint - Comma-separated BCP-47 codes (e.g. "ko,en"). Empty for auto-detect.
 * @returns {Promise<string>} Extracted text (may be empty).
 */
export async function ocrImage(base64, apiKey, langHint = '') {
  const imageContext = {};
  if (langHint) {
    imageContext.languageHints = langHint.split(',');
  }

  const body = {
    requests: [{
      image: { content: base64 },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
      imageContext,
    }],
  };

  const res = await fetch(
    VISION_ENDPOINT + '?key=' + encodeURIComponent(apiKey),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || ('HTTP ' + res.status);
    throw new Error(msg);
  }

  const r = data.responses?.[0];
  if (r?.error) throw new Error(r.error.message);

  if (r?.fullTextAnnotation?.text) {
    return r.fullTextAnnotation.text;
  }
  if (r?.textAnnotations?.[0]) {
    return r.textAnnotations[0].description || '';
  }
  return '';
}
