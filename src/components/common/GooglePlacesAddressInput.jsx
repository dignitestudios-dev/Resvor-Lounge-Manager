"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { loadGooglePlacesLibrary } from "@/lib/utils/googlePlacesLoader";

/**
 * GooglePlacesAddressInput
 *
 * Resilient, production-ready address autocomplete component.
 * - Uses singleton Google Maps & Places loader with fallback mechanisms.
 * - Works consistently across multiple mounts, modal open/close cycles, and fast switching.
 * - Supports modern Places AutocompleteSuggestion as well as legacy AutocompleteService.
 * - Preserves address text selection, coordinates (lat/lng), and placeId callback.
 */
export default function GooglePlacesAddressInput({
  value = "",
  onChange,
  onBlur,
  className,
  placeholder = "Enter business address",
  id,
  name,
  maxLength,
  disabled,
  onPlaceSelected,
  ...props
}) {
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "unavailable"
  const [placesApi, setPlacesApi] = useState(null);
  const legacyServiceRef = useRef(null);

  const latestValueRef = useRef(value);
  const requestIdRef = useRef(0);
  const userTypedRef = useRef(false);
  const debounceTimerRef = useRef(null);
  latestValueRef.current = value;

  // Load Google Places API reliably
  useEffect(() => {
    let isMounted = true;

    loadGooglePlacesLibrary()
      .then((places) => {
        if (!isMounted) return;
        setPlacesApi(places);
        setStatus("ready");

        // Set up legacy service fallback if available
        if (window.google?.maps?.places?.AutocompleteService) {
          legacyServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      })
      .catch((err) => {
        console.warn("Google Places load warning:", err?.message || err);
        if (isMounted) setStatus("unavailable");
      });

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const fetchSuggestions = useCallback(
    async (query) => {
      const requestId = ++requestIdRef.current;
      const trimmed = query?.trim() || "";

      if (!trimmed || trimmed.length < 2) {
        setSuggestions([]);
        return;
      }

      // Approach 1: Modern AutocompleteSuggestion API
      if (placesApi?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        try {
          const { suggestions: results = [] } =
            await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: trimmed,
            });

          if (requestIdRef.current !== requestId || latestValueRef.current !== query) return;

          const formatted = results.slice(0, 5).map((s, idx) => ({
            id: s.placePrediction?.placeId || `sug-${idx}`,
            text: s.placePrediction?.text?.toString() || "",
            raw: s,
            isModern: true,
          }));

          setSuggestions(formatted);
          setActiveIndex(-1);
          return;
        } catch (err) {
          console.debug("Modern places suggestion failed, checking legacy fallback:", err);
        }
      }

      // Approach 2: Legacy AutocompleteService fallback
      const service =
        legacyServiceRef.current ||
        (window.google?.maps?.places?.AutocompleteService
          ? new window.google.maps.places.AutocompleteService()
          : null);

      if (service) {
        service.getPlacePredictions(
          { input: trimmed },
          (predictions, status) => {
            if (requestIdRef.current !== requestId || latestValueRef.current !== query) return;
            if (status === "OK" && predictions?.length) {
              const formatted = predictions.slice(0, 5).map((p, idx) => ({
                id: p.place_id || `sug-${idx}`,
                text: p.description || "",
                placeId: p.place_id,
                raw: p,
                isModern: false,
              }));
              setSuggestions(formatted);
              setActiveIndex(-1);
            } else {
              setSuggestions([]);
            }
          }
        );
      }
    },
    [placesApi]
  );

  // If user typed while placesApi was still loading, trigger query once ready
  useEffect(() => {
    if (placesApi && userTypedRef.current && latestValueRef.current?.trim().length >= 2) {
      fetchSuggestions(latestValueRef.current);
    }
  }, [placesApi, fetchSuggestions]);

  const selectSuggestion = async (item) => {
    if (!item) return;
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    userTypedRef.current = false;

    const address = item.text;
    latestValueRef.current = address;
    onChange?.({ target: { name, value: address } });
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();

    // Fetch coordinates
    try {
      if (item.isModern && item.raw?.placePrediction?.toPlace) {
        const place = item.raw.placePrediction.toPlace();
        await place.fetchFields({
          fields: ["formattedAddress", "location", "id", "displayName"],
        });
        const resolvedAddress =
          place.formattedAddress || place.displayName?.text || address;
        const location = place.location;

        onPlaceSelected?.({
          address: resolvedAddress,
          placeId: place.id || item.id,
          lat: typeof location?.lat === "function" ? location.lat() : location?.lat,
          lng: typeof location?.lng === "function" ? location.lng() : location?.lng,
        });
        return;
      }

      // Legacy PlacesService geocoder or details fetch
      const placeId = item.placeId || item.id;
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const geoQuery = placeId ? { placeId } : { address };
        geocoder.geocode(geoQuery, (results, geoStatus) => {
          if (geoStatus === "OK" && results?.[0]) {
            const loc = results[0].geometry?.location;
            onPlaceSelected?.({
              address: results[0].formatted_address || address,
              placeId: results[0].place_id || placeId,
              lat: typeof loc?.lat === "function" ? loc.lat() : loc?.lat,
              lng: typeof loc?.lng === "function" ? loc.lng() : loc?.lng,
            });
          }
        });
      }
    } catch (err) {
      console.warn("Failed to fetch coordinates for place:", err);
    }
  };

  return (
    <div className="relative w-full">
      <input
        {...props}
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        aria-controls={suggestions.length ? `${id || name}-suggestions` : undefined}
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        onChange={(event) => {
          const nextValue = event.target.value;
          userTypedRef.current = true;
          latestValueRef.current = nextValue;
          onChange?.(event);

          if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

          if (!nextValue || nextValue.trim().length < 2) {
            requestIdRef.current++;
            setSuggestions([]);
            return;
          }

          debounceTimerRef.current = window.setTimeout(() => {
            fetchSuggestions(nextValue);
          }, 150);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length) {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp" && suggestions.length) {
            event.preventDefault();
            setActiveIndex((index) =>
              index <= 0 ? suggestions.length - 1 : index - 1
            );
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          } else if (event.key === "Escape") {
            setSuggestions([]);
          }
        }}
        onBlur={(event) => {
          onBlur?.(event);
          // Small delay to allow click/tap on suggestions before closing
          window.setTimeout(() => setSuggestions([]), 200);
        }}
      />

      {suggestions.length > 0 && (
        <ul
          id={`${id || name}-suggestions`}
          role="listbox"
          className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-gray-800 shadow-lg"
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer ${
                  index === activeIndex ? "bg-gray-100" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(item)}
              >
                {item.text}
              </button>
            </li>
          ))}
          <li className="px-3 py-1 text-right text-[10px] text-gray-500">
            Powered by Google
          </li>
        </ul>
      )}

      {status === "unavailable" && (
        <span className="sr-only">
          Address suggestions unavailable; you can enter an address manually.
        </span>
      )}
    </div>
  );
}
