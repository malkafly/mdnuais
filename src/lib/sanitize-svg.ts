/**
 * Simple SVG sanitizer that works in server environments without jsdom.
 * Strips dangerous elements (script, foreignObject, etc.) and event handler attributes.
 */
export function sanitizeSvg(svg: string): string {
  return svg
    // Remove script tags and content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    // Remove event handler attributes (on*)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript: URLs
    .replace(/\s+(?:href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "")
    // Remove foreignObject elements
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    // Remove iframe/embed/object
    .replace(/<(?:iframe|embed|object)[\s\S]*?(?:\/>|<\/(?:iframe|embed|object)>)/gi, "");
}
