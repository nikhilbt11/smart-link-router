// Converts arbitrary text into a URL-safe slug: lowercase, hyphen-separated,
// no leading/trailing/duplicate hyphens.
function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
