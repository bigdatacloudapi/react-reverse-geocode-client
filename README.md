# @bigdatacloudapi/react-reverse-geocode-client

React hook for **free reverse geocoding** — detect your user's city, country, and locality from GPS coordinates with automatic IP geolocation fallback. **No API key needed.**

Powered by [BigDataCloud](https://www.bigdatacloud.com)'s free client-side reverse geocoding API.

## Install

```bash
npm install @bigdatacloudapi/react-reverse-geocode-client
```

## Quick Start

```tsx
import { useLocation } from '@bigdatacloudapi/react-reverse-geocode-client';

function App() {
  const { data, loading, error, source } = useLocation();

  if (loading) return <p>Detecting location...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>📍 {data?.city}, {data?.countryName}</h1>
      <p>Region: {data?.principalSubdivision}</p>
      <p>Postcode: {data?.postcode}</p>
      <p>Detected via: {source}</p>
    </div>
  );
}
```

That's it. No API key, no account, no configuration.

## How It Works

1. **GPS first** — requests the browser's geolocation (user sees a permission prompt)
2. **IP fallback** — if GPS is denied or unavailable, automatically falls back to IP geolocation
3. **Same response** — identical JSON structure regardless of detection method

The response includes city, country, region, postcode, timezone, and detailed administrative/informative locality data in 100+ languages.

## API

### `useLocation(options?)`

React hook that detects the user's location on mount.

```tsx
const { data, loading, error, source, refresh } = useLocation({
  language: 'en',           // Locality language (ISO 639-1). Default: 'en'
  manual: false,            // Don't fetch on mount. Default: false
  timeout: 10000,           // GPS timeout in ms. Default: 10000
});
```

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | `LocationData \| null` | Location data (see below) |
| `loading` | `boolean` | True while detecting |
| `error` | `string \| null` | Error message if failed |
| `source` | `'gps' \| 'ip' \| null` | How location was determined |
| `refresh` | `() => void` | Manually trigger a new detection |

### `reverseGeocode(coords?, language?)`

Standalone async function — works outside React components.

```ts
import { reverseGeocode } from '@bigdatacloudapi/react-reverse-geocode-client';

// With coordinates
const data = await reverseGeocode({ latitude: 48.8566, longitude: 2.3522 });
console.log(data.city); // "Paris"

// IP fallback (no coordinates)
const data = await reverseGeocode();
console.log(data.countryName); // detected from IP
```

### Response Data

```ts
{
  latitude: number;
  longitude: number;
  lookupSource: 'coordinates' | 'ipGeolocation';
  continent: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  principalSubdivision: string;      // State/province
  principalSubdivisionCode: string;  // e.g. "US-CA"
  city: string;
  locality: string;                  // Neighbourhood/suburb
  postcode: string;
  plusCode: string;                   // Google Plus Code
  localityInfo: {
    administrative: [...],           // Country → state → city hierarchy
    informative: [...]               // Continent, timezone, etc.
  }
}
```

## Examples

### Multi-language

```tsx
// Get location names in Japanese
const { data } = useLocation({ language: 'ja' });
// data.countryName → "日本"
// data.city → "東京"
```

### Manual Trigger

```tsx
function SearchButton() {
  const { data, loading, refresh } = useLocation({ manual: true });

  return (
    <button onClick={refresh} disabled={loading}>
      {loading ? 'Detecting...' : 'Detect My Location'}
    </button>
  );
}
```

### Next.js / SSR

The hook is client-side only — it checks for `navigator` before accessing geolocation. For SSR frameworks, use it in client components:

```tsx
'use client';
import { useLocation } from '@bigdatacloudapi/react-reverse-geocode-client';
```

## Why BigDataCloud?

- ✅ **Free forever** — no API key, no account, no credit card
- ✅ **Privacy-first** — anonymous, no user tracking, GDPR compliant
- ✅ **GPS + IP fallback** — one hook handles both seamlessly
- ✅ **100+ languages** — locality names in any language
- ✅ **Fast** — sub-millisecond response times, global CDN
- ✅ **Accurate** — powered by [patented IP geolocation technology](https://www.bigdatacloud.com/insights/ip-geolocation-accuracy-report)

## Fair Use

This hook uses BigDataCloud's free client-side API, which is for **client-side use only** (browser/mobile). For server-side or testing, use the [server-side API](https://www.bigdatacloud.com/reverse-geocoding/reverse-geocode-to-city-api) with a [free API key](https://www.bigdatacloud.com/login). See the [fair use policy](https://www.bigdatacloud.com/support/fair-use-policy-for-free-client-side-reverse-geocoding-api).

## Need More?

- **Full IP geolocation** — [IP Geolocation API](https://www.bigdatacloud.com/ip-geolocation)
- **Server-side geocoding** — [Reverse Geocoding API](https://www.bigdatacloud.com/reverse-geocoding)
- **AI integration** — [MCP Server](https://www.npmjs.com/package/@bigdatacloudapi/mcp-server) for AI assistants
- **Node.js client** — [`@bigdatacloudapi/client`](https://www.npmjs.com/package/@bigdatacloudapi/client)

## License

MIT
