// File: lib/sanitizer.ts
import sanitizeHtml from "sanitize-html";

export const ARTICLE_ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "b",
  "i",
  "strong",
  "em",
  "strike",
  "u",
  "s",
  "code",
  "pre",
  "hr",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "figure",
  "figcaption",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
];

export const ARTICLE_ALLOWED_ATTRIBUTES = {
  a: ["href", "name", "target", "rel", "title", "class"],
  img: ["src", "alt", "title", "width", "height", "loading", "class"],
  "*": ["class", "id", "title", "data-*"],
};

export const ARTICLE_ALLOWED_SCHEMES = ["http", "https", "mailto"];

/**
 * Sanitizes article HTML content before saving to the database.
 * Preserves editorial formatting (headings, lists, quotes, tables, links, images)
 * while stripping script execution, iframes, malicious protocols, and inline event handlers.
 */
export function sanitizeArticleHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags: ARTICLE_ALLOWED_TAGS,
    allowedAttributes: ARTICLE_ALLOWED_ATTRIBUTES,
    allowedSchemes: ARTICLE_ALLOWED_SCHEMES,
    allowedSchemesByTag: {
      a: ARTICLE_ALLOWED_SCHEMES,
      img: ["http", "https", "data"], // data URI allowed only for base64 preview images
    },
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => {
        // Force rel="noopener noreferrer" on external links
        const href = attribs.href || "";
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(isExternal && { rel: "noopener noreferrer", target: "_blank" }),
          },
        };
      },
    },
  });
}
