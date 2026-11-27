import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("CreateLoungeModal defines and calls resetAllFormikSteps on modal close and open", () => {
  const content = fs.readFileSync(
    path.resolve("src/components/lounge-components/CreateLoungeModal.jsx"),
    "utf8"
  );
  assert.ok(content.includes("resetAllFormikSteps"), "Should define resetAllFormikSteps");
  assert.ok(content.includes("step1Formik.resetForm"), "Should reset step 1 formik");
  assert.ok(content.includes("step2Formik.resetForm"), "Should reset step 2 formik");
  assert.ok(content.includes("step3Formik.resetForm"), "Should reset step 3 formik");
  assert.ok(content.includes("if (!isOpen) resetAllFormikSteps()"), "Should reset when Dialog onOpenChange closes");
  assert.ok(content.includes("if (!open)"), "Should run reset effect when open is false");
});
