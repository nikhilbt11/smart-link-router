const { UAParser } = require('ua-parser-js');

// OS names ua-parser-js may report for non-mobile platforms.
const DESKTOP_OS_NAMES = new Set([
  'Windows',
  'macOS',
  'Mac OS', // older ua-parser-js versions used this label
  'Linux',
  'Ubuntu',
  'Debian',
  'Fedora',
  'Chromium OS',
  'CentOS',
  'Red Hat',
]);

function normalizePlatform(osName) {
  if (osName === 'iOS') return 'iOS';
  if (osName === 'Android') return 'Android';
  if (osName && DESKTOP_OS_NAMES.has(osName)) return 'Desktop';
  return 'Other';
}

// Parses a raw User-Agent string into the fields the redirect + analytics flow need.
// Missing/empty/unrecognized User-Agent strings normalize to platform "Other".
function parseUserAgent(userAgentString) {
  const result = new UAParser(userAgentString || '').getResult();

  return {
    platform: normalizePlatform(result.os.name),
    deviceType: result.device.type || 'desktop',
    browser: result.browser.name || null,
  };
}

module.exports = { parseUserAgent };
