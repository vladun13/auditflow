import dns from 'dns/promises'
import net from 'net'

// RFC-1918 private ranges, loopback, link-local, and cloud metadata endpoints
const PRIVATE_RANGES = [
  /^127\./,                         // loopback
  /^10\./,                          // RFC-1918
  /^172\.(1[6-9]|2\d|3[01])\./,    // RFC-1918
  /^192\.168\./,                    // RFC-1918
  /^169\.254\./,                    // link-local / cloud metadata (AWS, GCP, Azure)
  /^100\.6[4-9]\.|^100\.[7-9]\d\.|^100\.1[01]\d\.|^100\.12[0-7]\./, // CGNAT
  /^0\./,                           // "this" network
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 unique local
  /^fe80:/i,                        // IPv6 link-local
]

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '169.254.169.254',               // AWS/GCP/Azure IMDS
  'metadata.google.internal',      // GCP metadata
  'metadata',
])

/**
 * Validates a URL is safe to scan — must be http/https and must not target
 * private networks, loopback, or cloud metadata endpoints.
 */
export async function validateScanUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string }> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only http and https URLs are allowed' }
  }

  const hostname = parsed.hostname.toLowerCase()

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, reason: 'URL target is not allowed' }
  }

  // If the hostname is a bare IP address, check it directly
  if (net.isIP(hostname)) {
    for (const range of PRIVATE_RANGES) {
      if (range.test(hostname)) {
        return { valid: false, reason: 'URL target is not allowed' }
      }
    }
    return { valid: true }
  }

  // Resolve hostname to catch SSRF via DNS rebinding / internal hostnames
  try {
    const addresses = await dns.lookup(hostname, { all: true })
    for (const { address } of addresses) {
      if (BLOCKED_HOSTNAMES.has(address)) {
        return { valid: false, reason: 'URL target is not allowed' }
      }
      for (const range of PRIVATE_RANGES) {
        if (range.test(address)) {
          return { valid: false, reason: 'URL target is not allowed' }
        }
      }
    }
  } catch {
    return { valid: false, reason: 'Could not resolve hostname' }
  }

  return { valid: true }
}
