/**
 * Singleton Google Maps & Places JavaScript API loader.
 * Ensures that the script is injected at most once, handles existing scripts,
 * libraries loading (both new importLibrary and legacy places), and recovers from errors.
 */

let mapsPromise = null;

export function loadGooglePlacesLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps requires a browser environment."));
  }

  // If already loaded and ready
  if (window.google?.maps?.places?.AutocompleteSuggestion || window.google?.maps?.places?.AutocompleteService) {
    if (window.google.maps.importLibrary) {
      return window.google.maps.importLibrary("places");
    }
    return Promise.resolve(window.google.maps.places);
  }

  if (mapsPromise) {
    return mapsPromise;
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(new Error("Google Maps API key is not configured in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."));
  }

  mapsPromise = new Promise((resolve, reject) => {
    const checkReady = () => {
      if (window.google?.maps?.importLibrary) {
        window.google.maps
          .importLibrary("places")
          .then((places) => resolve(places))
          .catch((err) => reject(err));
        return true;
      }
      if (window.google?.maps?.places) {
        resolve(window.google.maps.places);
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    // Check if script is already present in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        if (!checkReady()) {
          // Poll briefly if script finished but window.google is initializing
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (checkReady()) {
              clearInterval(interval);
            } else if (attempts > 30) {
              clearInterval(interval);
              reject(new Error("Google Maps script present but failed to initialize."));
            }
          }, 50);
        }
        return;
      }

      // Script exists but is still loading
      const prevOnload = existingScript.onload;
      const prevOnerror = existingScript.onerror;

      existingScript.onload = (e) => {
        if (typeof prevOnload === "function") prevOnload(e);
        existingScript.setAttribute("data-loaded", "true");
        if (!checkReady()) {
          setTimeout(() => {
            if (!checkReady()) reject(new Error("Google Maps failed to initialize after loading."));
          }, 100);
        }
      };

      existingScript.onerror = (e) => {
        if (typeof prevOnerror === "function") prevOnerror(e);
        reject(new Error("Google Maps script failed to load."));
      };
      return;
    }

    // Inject script
    const script = document.createElement("script");
    script.id = "google-maps-js";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      if (!checkReady()) {
        setTimeout(() => {
          if (!checkReady()) reject(new Error("Google Maps failed to initialize after loading."));
        }, 100);
      }
    };

    script.onerror = () => {
      reject(new Error("Google Maps failed to load."));
    };

    document.head.appendChild(script);
  }).catch((err) => {
    // Reset promise so subsequent calls can retry
    mapsPromise = null;
    throw err;
  });

  return mapsPromise;
}
