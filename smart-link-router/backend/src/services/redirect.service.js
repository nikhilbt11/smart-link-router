const Link = require('../models/Link');
const AppError = require('../utils/AppError');
const { normalizeAlias, isValidHttpUrl } = require('../utils/linkFields');
const { parseUserAgent } = require('../utils/userAgent');

function selectDestination(link, platform) {
  if (platform === 'iOS') return link.iosUrl;
  if (platform === 'Android') return link.androidUrl;
  return link.desktopUrl;
}

// Resolves a smart-link alias into a destination URL plus the data Module 4's
// analytics logging will need. Performs a single DB read — no writes here.
async function resolveRedirect({ alias, userAgentString, ip, referrer }) {
  const normalizedAlias = normalizeAlias(alias);

  const link = await Link.findOne({ alias: normalizedAlias });
  if (!link || !link.isActive) {
    throw new AppError('Link not found', 404);
  }

  const { platform, deviceType, browser } = parseUserAgent(userAgentString);
  const destinationUrl = selectDestination(link, platform);

  // Defense-in-depth: destination URLs are already validated on write (Module 2),
  // but never redirect to a value that isn't a valid http(s) URL.
  if (!isValidHttpUrl(destinationUrl)) {
    throw new AppError('Destination URL is not configured correctly for this link', 500);
  }

  const analyticsEvent = {
    linkId: link._id,
    alias: link.alias,
    platform,
    deviceType,
    browser,
    userAgent: userAgentString || null,
    ip: ip || null,
    referrer: referrer || null,
    timestamp: new Date(),
  };

  return { destinationUrl, analyticsEvent };
}

module.exports = { resolveRedirect };
