const redirectService = require('../services/redirect.service');
const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

const redirectByAlias = asyncHandler(async (req, res) => {
  const { alias } = req.params;
  const userAgentString = req.headers['user-agent'];
  const referrer = req.headers['referer'] || req.headers['referrer'];
  // req.ip reflects the direct socket address unless TRUST_PROXY is enabled
  // (see app.js), so it can't be spoofed via client-supplied headers.
  const ip = req.ip;

  const { destinationUrl, analyticsEvent } = await redirectService.resolveRedirect({
    alias,
    userAgentString,
    ip,
    referrer,
  });

  res.redirect(302, destinationUrl);

  // Fire-and-forget, scheduled after the response is sent. A failure here must
  // never affect the already-completed redirect — only ever log it.
  setImmediate(() => {
    analyticsService.recordClick(analyticsEvent).catch((err) => {
      console.error('[Analytics] failed to persist click event:', err.message);
    });
  });
});

module.exports = { redirectByAlias };
