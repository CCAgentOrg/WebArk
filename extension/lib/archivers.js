/**
 * WebArk - Multi-provider archiver
 */

/**
 * Archive a URL using multiple providers
 * @param {string} url - URL to archive
 * @returns {Promise<{provider: string, snapshotUrl: string, archivedAt: string}>}
 */
export async function archiveUrl(url) {
  const providers = [
    { name: 'wayback', fn: archiveWayback },
    { name: 'archive.is', fn: archiveArchiveIs },
    { name: 'ghostarchive', fn: archiveGhostarchive },
    { name: 'archive.ph', fn: archiveArchivePh },
  ];

  let lastError = null;

  for (const provider of providers) {
    try {
      const result = await provider.fn(url);
      if (result) {
        return {
          provider: provider.name,
          snapshotUrl: result,
          archivedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`${provider.name} failed:`, error.message);
    }
  }

  throw new Error(`All archive providers failed. Last error: ${lastError?.message}`);
}

/**
 * Archive via Wayback Machine
 */
async function archiveWayback(url) {
  // Check if snapshot exists
  const checkUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  const response = await fetch(checkUrl);

  if (!response.ok) {
    throw new Error(`Wayback check failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.archived_snapshots?.closest?.available) {
    return data.archived_snapshots.closest.url;
  }

  // Create new snapshot
  const saveUrl = `https://web.archive.org/save/${encodeURIComponent(url)}`;
  const saveResponse = await fetch(saveUrl, { method: 'GET' });

  if (saveResponse.ok || saveResponse.status === 200) {
    // Wait a moment and check again
    await new Promise(resolve => setTimeout(resolve, 2000));

    const checkAgain = await fetch(checkUrl);
    const dataAgain = await checkAgain.json();

    if (dataAgain.archived_snapshots?.closest?.url) {
      return dataAgain.archived_snapshots.closest.url;
    }
  }

  return null;
}

/**
 * Archive via archive.is
 */
async function archiveArchiveIs(url) {
  const submitUrl = `https://archive.is/submit/`;
  const response = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(url)}`
  });

  if (response.ok) {
    // Extract snapshot ID from response
    const text = await response.text();
    const match = text.match(/archive\.is\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://archive.is/${match[1]}/${url}`;
    }
  }

  // Fallback: check if already archived
  const checkUrl = `https://archive.is/${url}`;
  const checkResponse = await fetch(checkUrl, { method: 'HEAD' });

  if (checkResponse.ok) {
    return checkUrl;
  }

  return null;
}

/**
 * Archive via ghostarchive.org
 */
async function archiveGhostarchive(url) {
  // Ghostarchive no longer active, return null
  return null;
}

/**
 * Archive via archive.ph
 */
async function archiveArchivePh(url) {
  const submitUrl = `https://archive.ph/submit/`;
  const response = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(url)}`
  });

  if (response.ok) {
    const text = await response.text();
    const match = text.match(/archive\.ph\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://archive.ph/${match[1]}/${url}`;
    }
  }

  return null;
}

/**
 * Get available snapshots for a URL (Wayback)
 */
export async function getSnapshots(url) {
  const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Wayback API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.archived_snapshots) {
    return [];
  }

  return [{
    url: data.archived_snapshots.closest.url,
    timestamp: data.archived_snapshots.closest.timestamp,
    available: data.archived_snapshots.closest.available
  }];
}

/**
 * Validate URL format
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
