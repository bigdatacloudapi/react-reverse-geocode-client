import { useState, useEffect, useCallback } from "react";

const API_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

export interface LocationData {
  latitude: number;
  longitude: number;
  lookupSource: "coordinates" | "ipGeolocation";
  continent: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  principalSubdivision: string;
  principalSubdivisionCode: string;
  city: string;
  locality: string;
  postcode: string;
  plusCode: string;
  localityInfo: {
    administrative: Array<{
      name: string;
      description: string;
      order: number;
      adminLevel: number;
      isoCode?: string;
      wikidataId?: string;
      geonameId?: number;
    }>;
    informative: Array<{
      name: string;
      description: string;
      order: number;
      isoCode?: string;
      wikidataId?: string;
      geonameId?: number;
    }>;
  };
}

export interface UseLocationOptions {
  /** Language for locality names (ISO 639-1). Default: "en" */
  language?: string;
  /** Skip GPS and use IP geolocation only. Default: false */
  ipOnly?: boolean;
  /** Don't fetch automatically on mount. Use refresh() instead. Default: false */
  manual?: boolean;
  /** GPS timeout in milliseconds. Default: 10000 */
  timeout?: number;
  /** Use high accuracy GPS (slower but more precise). Default: true */
  enableHighAccuracy?: boolean;
}

export interface UseLocationResult {
  /** Location data from BigDataCloud */
  data: LocationData | null;
  /** Loading state */
  loading: boolean;
  /** Error if location fetch failed */
  error: string | null;
  /** How the location was determined */
  source: "gps" | "ip" | null;
  /** Manually trigger a location refresh */
  refresh: () => void;
}

/**
 * React hook for free reverse geocoding with BigDataCloud.
 * No API key needed. Uses GPS with automatic IP geolocation fallback.
 *
 * @example
 * ```tsx
 * import { useLocation } from '@bigdatacloudapi/react-reverse-geocode-client';
 *
 * function App() {
 *   const { data, loading, error } = useLocation();
 *
 *   if (loading) return <p>Detecting location...</p>;
 *   if (error) return <p>Error: {error}</p>;
 *
 *   return (
 *     <p>
 *       You're in {data?.city}, {data?.countryName}
 *     </p>
 *   );
 * }
 * ```
 */
export function useLocation(
  options: UseLocationOptions = {}
): UseLocationResult {
  const {
    language = "en",
    ipOnly = false,
    manual = false,
    timeout = 10000,
    enableHighAccuracy = true,
  } = options;

  const [data, setData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"gps" | "ip" | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let lat: number | undefined;
      let lng: number | undefined;

      // Try GPS first (unless ipOnly)
      if (!ipOnly && typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy,
                timeout,
                maximumAge: 60000,
              });
            }
          );
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          // GPS failed or denied — fall through to IP
        }
      }

      // Build URL
      let url = `${API_URL}?localityLanguage=${encodeURIComponent(language)}`;
      if (lat !== undefined && lng !== undefined) {
        url += `&latitude=${lat}&longitude=${lng}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const locationData: LocationData = await res.json();

      setData(locationData);
      setSource(
        locationData.lookupSource === "ipGeolocation" ? "ip" : "gps"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to detect location"
      );
    } finally {
      setLoading(false);
    }
  }, [language, ipOnly, timeout, enableHighAccuracy]);

  useEffect(() => {
    if (!manual) {
      fetchLocation();
    }
  }, [manual, fetchLocation]);

  return { data, loading, error, source, refresh: fetchLocation };
}

/**
 * Standalone function (non-hook) for one-off reverse geocoding.
 * Works outside React components.
 *
 * @example
 * ```ts
 * import { reverseGeocode } from '@bigdatacloudapi/react-reverse-geocode-client';
 *
 * // With coordinates
 * const data = await reverseGeocode({ latitude: -34.9285, longitude: 138.6007 });
 *
 * // IP fallback (no coordinates)
 * const data = await reverseGeocode();
 * ```
 */
export async function reverseGeocode(
  coords?: { latitude: number; longitude: number },
  language = "en"
): Promise<LocationData> {
  let url = `${API_URL}?localityLanguage=${encodeURIComponent(language)}`;

  if (coords) {
    url += `&latitude=${coords.latitude}&longitude=${coords.longitude}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`BigDataCloud API returned ${res.status}`);
  }

  return res.json();
}

export default useLocation;
