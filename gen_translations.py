#!/usr/bin/env python3
# Generate translations for 50 languages

translations = {
    'it': 'Italian',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'cs': 'Czech',
    'el': 'Greek',
    'he': 'Hebrew',
    'hu': 'Hungarian',
    'id': 'Indonesian',
    'ms': 'Malay',
    'ro': 'Romanian',
    'sk': 'Slovak',
    'uk': 'Ukrainian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'hr': 'Croatian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'sr': 'Serbian',
    'sl': 'Slovenian',
    'tl': 'Tagalog',
    'bn': 'Bengali',
    'fa': 'Persian',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'gu': 'Gujarati',
    'mr': 'Marathi',
    'pa': 'Punjabi',
    'ur': 'Urdu',
    'ne': 'Nepali',
    'sw': 'Swahili',
    'af': 'Afrikaans',
}

# Generate JS object
for code, name in translations.items():
    print(f"      {code}: {{")
    print(f"        appName: 'WebArk',")
    print(f"        archive: '{name} Archive',")
    print(f"        checkStatus: 'Check Status',")
    print(f"        crawl: 'Crawl',")
    print(f"        history: 'History',")
    print(f"        settings: 'Settings',")
    print(f"        about: 'About',")
    print(f"        archiveUrls: 'Archive URLs',")
    print(f"        clear: 'Clear',")
    print(f"        findLinks: 'Find Links',")
    print(f"        checkAllStatus: 'Check Status',")
    print(f"        archiveAll: 'Archive All',")
    print(f"        archiveUnarchived: 'Archive Unarchived',")
    print(f"        archiveSelected: 'Archive Selected',")
    print(f"        urls: 'Enter URLs',")
    print(f"        crawlUrl: 'Enter URL to crawl',")
    print(f"        statusUrl: 'Enter URL to check',")
    print(f"        depth: 'Depth',")
    print(f"        oneLevel: '1 Level',")
    print(f"        twoLevels: '2 Levels',")
    print(f"        options: 'Options',")
    print(f"        includeExternal: 'Include external',")
    print(f"        skipTopSites: 'Skip top sites',")
    print(f"        archived: 'Archived',")
    print(f"        notArchived: 'Not archived',")
    print(f"        checking: 'Checking...',")
    print(f"        internal: 'Internal',")
    print(f"        external: 'External',")
    print(f"        totalLinks: 'Total Links',")
    print(f"        needArchive: 'Need Archive',")
    print(f"        success: 'Success',")
    print(f"        failed: 'Failed',")
    print(f"        opened: 'Opened',")
    print(f"        archivePages: 'pages archived!',")
    print(f"        enterUrls: 'Enter URLs',")
    print(f"        invalidUrl: 'Invalid URL',")
    print(f"        noLinksFound: 'No links found',")
    print(f"        localArchives: 'Local Archives',")
    print(f"        noHistory: 'No history yet',")
    print(f"        view: 'View',")
    print(f"        delete: 'Delete',")
    print(f"        defaultProvider: 'Default Provider',")
    print(f"        defaultDepth: 'Default Depth',")
    print(f"        autoCheck: 'Auto-check Status',")
    print(f"        backgroundMode: 'Background Mode',")
    print(f"        rateLimit: 'Rate Limit (ms)',")
    print(f"        resetDefaults: 'Reset Defaults',")
    print(f"        language: 'Language',")
    print(f"        noAccount: 'No account required',")
    print(f"        noServer: 'No server required'")
    print(f"      }},")
    print()
