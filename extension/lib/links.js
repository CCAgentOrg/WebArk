// WebArk - Link extraction utilities
// Serverless link finding for web archiving

/**
 * Extract links from Wayback Machine CDX index
 * @param {string} url - Base URL to find links for
 * @returns {Promise<Array>} - Array of link objects
 */
export async function findLinksFromWayback(url) {
  const baseUrl = new URL(url);
  const domain = baseUrl.hostname;
  const links = new Map();
  
  try {
    // Use CDX API with matchType=prefix to get all subpages
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain + '/*')}&output=json&fl=original&filter=statuscode:200&limit=500`
    );
    const data = await res.json();
    
    if (data && data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        const originalUrl = data[i][0];
        if (originalUrl && isValidUrl(originalUrl)) {
          // Normalize and deduplicate
          const normalized = normalizeUrl(originalUrl);
          if (!links.has(normalized)) {
            const linkUrl = new URL(normalized);
            links.set(normalized, {
              url: normalized,
              internal: linkUrl.hostname === baseUrl.hostname,
              status: 'unknown'
            });
          }
        }
      }
    }
  } catch (e) {
    console.error('Wayback CDX error:', e);
  }
  
  return Array.from(links.values());
}

/**
 * Extract links from a page using text extraction
 * @param {string} url - URL to extract links from
 * @returns {Promise<Array>} - Array of link objects
 */
export async function findLinksFromPage(url) {
  const baseUrl = new URL(url);
  const links = new Map();
  
  try {
    // Use AllOrigins proxy to get page content
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    
    if (data.contents) {
      // Parse HTML and extract links
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Get all anchor tags
      const anchors = doc.querySelectorAll('a[href]');
      for (const anchor of anchors) {
        try {
          const href = anchor.getAttribute('href');
          if (!href) continue;
          
          // Handle relative URLs
          let fullUrl;
          try {
            fullUrl = new URL(href, baseUrl).href;
          } catch {
            continue;
          }
          
          // Filter out non-http URLs and common non-content URLs
          if (!fullUrl.startsWith('http') || fullUrl.match(/\.(jpg|png|gif|css|js|woff|svg|pdf|zip)$/i)) {
            continue;
          }
          
          if (!links.has(fullUrl)) {
            const linkUrl = new URL(fullUrl);
            links.set(fullUrl, {
              url: fullUrl,
              internal: linkUrl.hostname === baseUrl.hostname,
              status: 'unknown'
            });
          }
        } catch {}
      }
    }
  } catch (e) {
    console.error('Page extraction error:', e);
  }
  
  return Array.from(links.values());
}

/**
 * Find links using multiple methods
 * @param {string} url - Base URL
 * @param {number} depth - 1 or 2
 * @param {boolean} includeExternal - Include external links
 * @returns {Promise<Array>} - Array of link objects
 */
export async function findAllLinks(url, depth = 1, includeExternal = true) {
  const baseUrl = new URL(url);
  const links = new Map();
  
  // Always add the base URL
  links.set(url, { url, internal: true, status: 'unknown' });
  
  if (depth === 1) {
    return Array.from(links.values());
  }
  
  // Try Wayback first
  let waybackLinks = await findLinksFromWayback(url);
  
  // If no links from Wayback, try page extraction
  if (waybackLinks.length <= 1) {
    waybackLinks = await findLinksFromPage(url);
  }
  
  // Add all found links
  for (const link of waybackLinks) {
    if (link.url === url) continue; // Skip base URL (already added)
    
    const linkUrl = new URL(link.url);
    const isInternal = linkUrl.hostname === baseUrl.hostname;
    
    if (isInternal || includeExternal) {
      links.set(link.url, { ...link, internal: isInternal });
    }
  }
  
  return Array.from(links.values()).slice(0, 100);
}

/**
 * Check if a URL is valid
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize URL by removing trailing slashes and fragments
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    // Remove default ports
    if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
      u.port = '';
    }
    return u.href.replace(/\/$/, '');
  } catch {
    return url;
  }
}

/**
 * Get unique URLs from a list
 */
export function deduplicateLinks(links) {
  const seen = new Map();
  for (const link of links) {
    const key = normalizeUrl(link.url);
    if (!seen.has(key)) {
      seen.set(key, link);
    }
  }
  return Array.from(seen.values());
}
