// Shared helpers for working with Link alias/URL fields (used by validators and the redirect engine).

function normalizeAlias(alias) {
  return typeof alias === 'string' ? alias.trim().toLowerCase() : alias;
}

function isValidHttpUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { normalizeAlias, isValidHttpUrl };
