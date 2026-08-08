const geoip = require('geoip-lite');

// geoip-lite ships an offline/local IP-to-country database (no network calls,
// so it's safe to use even inline in a request path). Limitations to document:
// - Accuracy is approximate; only country-level lookups are relied on here.
// - The bundled dataset is a point-in-time snapshot and can drift out of date;
//   refresh it periodically with `npm update geoip-lite`.
// - Private/reserved/loopback IPs (127.0.0.1, ::1, 10.x, 192.168.x, etc.) are
//   never resolvable and always fall back to "Unknown" — expected in local dev.
function lookupCountry(ip) {
  if (!ip) return 'Unknown';
  const result = geoip.lookup(ip);
  return result?.country || 'Unknown';
}

module.exports = { lookupCountry };
