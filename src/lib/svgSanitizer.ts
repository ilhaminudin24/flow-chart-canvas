/**
 * SVG Sanitizer to prevent XSS attacks
 * Removes dangerous elements and attributes from SVG content
 */

/**
 * Sanitize SVG content by removing potentially dangerous elements and attributes
 */
export function sanitizeSvg(svg: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    return svg;
  }

  const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
  const DANGEROUS_ATTR_PREFIXES = ['on', 'javascript:', 'data:'];
  const DANGEROUS_ATTRS = ['xlink:href', 'href', 'formaction'];

  function sanitizeElement(element: Element) {
    // Remove dangerous tags
    if (DANGEROUS_TAGS.includes(element.tagName.toLowerCase())) {
      element.remove();
      return;
    }

    const attrsToRemove: string[] = [];

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.toLowerCase();

      let isDangerous = false;

      for (const prefix of DANGEROUS_ATTR_PREFIXES) {
        if (attrName.startsWith(prefix) || attrValue.startsWith(prefix)) {
          isDangerous = true;
          break;
        }
      }

      if (DANGEROUS_ATTRS.includes(attrName)) {
        isDangerous = true;
      }

      if (isDangerous) {
        attrsToRemove.push(attr.name);
      }
    }

    attrsToRemove.forEach(attrName => element.removeAttribute(attrName));

    for (let i = 0; i < element.children.length; i++) {
      sanitizeElement(element.children[i] as Element);
    }
  }

  sanitizeElement(svgElement);

  return new XMLSerializer().serializeToString(svgElement);
}
