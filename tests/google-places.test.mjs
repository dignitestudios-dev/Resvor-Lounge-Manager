import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadGooglePlacesLibrary } from "../src/lib/utils/googlePlacesLoader.js";

test("googlePlacesLoader rejects cleanly when no window/browser is present", async () => {
  await assert.rejects(
    async () => {
      await loadGooglePlacesLibrary();
    },
    {
      name: "Error",
      message: "Google Maps requires a browser environment.",
    }
  );
});

test("GooglePlacesAddressInput is imported and rendered with onPlaceSelected in CreateLoungeModal", () => {
  const fileContent = fs.readFileSync(
    path.resolve("src/components/lounge-components/CreateLoungeModal.jsx"),
    "utf8"
  );
  assert.ok(fileContent.includes("import GooglePlacesAddressInput"));
  assert.ok(fileContent.includes("<GooglePlacesAddressInput"));
  assert.ok(fileContent.includes("onPlaceSelected={updateBusinessCoordinates}"));
});

test("GooglePlacesAddressInput is imported and rendered with onPlaceSelected in EditProfileModal (Edit Lounge)", () => {
  const fileContent = fs.readFileSync(
    path.resolve("src/components/profile/EditProfileModal.jsx"),
    "utf8"
  );
  assert.ok(fileContent.includes("import GooglePlacesAddressInput"));
  assert.ok(fileContent.includes("<GooglePlacesAddressInput"));
  assert.ok(fileContent.includes("onPlaceSelected={(coordinates) => setBusinessCoordinates(coordinates)}"));
});

test("GooglePlacesAddressInput uses singleton loadGooglePlacesLibrary and supports modern + legacy fallback", () => {
  const fileContent = fs.readFileSync(
    path.resolve("src/components/common/GooglePlacesAddressInput.jsx"),
    "utf8"
  );
  assert.ok(fileContent.includes("loadGooglePlacesLibrary"));
  assert.ok(fileContent.includes("AutocompleteSuggestion"));
  assert.ok(fileContent.includes("AutocompleteService"));
  assert.ok(fileContent.includes("fetchFields"));
});
