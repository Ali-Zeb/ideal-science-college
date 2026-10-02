import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4", "ul", "ol", "li",
  "blockquote", "a", "img", "hr", "code", "pre", "span",
];

/**
 * Sanitizes rich-text HTML from the editor: keeps formatting tags only,
 * strips scripts, event handlers and unsafe URLs, and forces safe link targets.
 * @param html - Untrusted HTML.
 */
export function sanitizeHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  });
  return clean.replace(/<a /g, '<a rel="noopener noreferrer" ');
}
