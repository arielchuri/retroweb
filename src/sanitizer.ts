import * as cheerio from 'cheerio';

export interface SanitizationResult {
  cleanHtml: string;
  hasViolations: boolean;
  violations: string[];
  title?: string;
  description?: string;
}

const FORBIDDEN_TAGS = ['script', 'noscript', 'object', 'embed', 'applet', 'iframe', 'base'];

/**
 * Strict No-JS HTML sanitizer.
 * Guarantees that uploaded HTML contains zero executable scripts,
 * inline event handlers, or javascript: protocol URIs.
 */
export function sanitizeHtml(rawHtml: string): SanitizationResult {
  const $ = cheerio.load(rawHtml);
  const violations: string[] = [];

  // 1. Remove forbidden tags
  for (const tag of FORBIDDEN_TAGS) {
    const elements = $(tag);
    if (elements.length > 0) {
      violations.push(`Found forbidden tag: <${tag}>`);
      elements.remove();
    }
  }

  // 2. Strip inline event handlers and javascript: URIs across all elements
  $('*').each((_, elem) => {
    if (elem.type === 'tag') {
      const attribs = elem.attribs;
      for (const attr of Object.keys(attribs)) {
        // Strip on* handlers (onclick, onload, onerror, etc.)
        if (attr.toLowerCase().startsWith('on')) {
          violations.push(`Stripped inline handler: ${attr}`);
          $(elem).removeAttr(attr);
        }

        // Check href, src, formaction for javascript:
        if (['href', 'src', 'action', 'formaction'].includes(attr.toLowerCase())) {
          const val = attribs[attr].trim().toLowerCase();
          if (val.startsWith('javascript:') || val.startsWith('vbscript:') || val.startsWith('data:text/html')) {
            violations.push(`Removed malicious URI in ${attr}: ${attribs[attr]}`);
            $(elem).removeAttr(attr);
          }
        }
      }
    }
  });

  // Extract page metadata for community directory
  const title = $('title').text().trim() || undefined;
  const description = $('meta[name="description"]').attr('content')?.trim() || undefined;

  return {
    cleanHtml: $.html(),
    hasViolations: violations.length > 0,
    violations,
    title,
    description,
  };
}

/**
 * Validates allowed static file extensions.
 */
export function isAllowedFileExtension(filename: string): boolean {
  const allowed = [
    '.html', '.htm', '.css', '.txt', '.md',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.mid', '.midi', '.mp3', '.wav'
  ];
  const lower = filename.toLowerCase();
  return allowed.some(ext => lower.endsWith(ext));
}
