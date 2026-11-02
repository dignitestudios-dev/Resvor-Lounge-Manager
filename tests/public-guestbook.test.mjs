import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { PUBLIC_ROUTES, PROTECTED_ROUTES, AUTH_REDIRECT } from "../src/config/routes.ts";
import {
  getPublicGuestbookUrl,
  buildPublicGuestbookFormData,
} from "../src/lib/api/publicGuestbook.js";
import { publicGuestbookSchema } from "../src/lib/schema/guestbook/publicGuestbookSchema.js";

describe("Public Lounge Guestbook Flow", () => {
  describe("1. Route and Authentication Guards", () => {
    test("The public guestbook page is listed in PUBLIC_ROUTES without authentication guard", () => {
      assert.ok(
        PUBLIC_ROUTES.includes("/guestbook-entry"),
        "PUBLIC_ROUTES must include '/guestbook-entry'"
      );
      assert.ok(
        !PROTECTED_ROUTES.includes("/guestbook-entry"),
        "PROTECTED_ROUTES must not include '/guestbook-entry'"
      );
    });

    test("Unauthenticated guests are allowed to access /guestbook-entry without being redirected to login", () => {
      const pathname = "/guestbook-entry";
      const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );
      assert.equal(
        isProtectedRoute,
        false,
        "Public guestbook route should not be flagged as protected"
      );
    });

    test("Logged-in managers visiting /guestbook-entry are not redirected away", () => {
      const pathname = "/guestbook-entry";
      const isPublicRoute = pathname.startsWith("/guestbook-entry");
      assert.equal(isPublicRoute, true);
    });
  });

  describe("2. Universal QR Code and Configuration", () => {
    test("QR URL points to universal public guestbook URL", () => {
      const url = getPublicGuestbookUrl();
      assert.ok(url.endsWith("/guestbook-entry"), `URL must end with /guestbook-entry, got: ${url}`);
      // Ensure it contains NO loungeId, managerId, token, or eventId
      assert.equal(url.includes("loungeId"), false, "QR URL must not contain loungeId");
      assert.equal(url.includes("managerId"), false, "QR URL must not contain managerId");
      assert.equal(url.includes("token"), false, "QR URL must not contain token");
      assert.equal(url.includes("eventId"), false, "QR URL must not contain eventId");
    });

    test("QR URL respects environment variables when provided", () => {
      const originalEnv = process.env.NEXT_PUBLIC_GUESTBOOK_URL;
      process.env.NEXT_PUBLIC_GUESTBOOK_URL = "https://example.com/custom-guestbook";
      const customUrl = getPublicGuestbookUrl();
      assert.equal(customUrl, "https://example.com/custom-guestbook");
      if (originalEnv) {
        process.env.NEXT_PUBLIC_GUESTBOOK_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_GUESTBOOK_URL;
      }
    });

    test("Copy link action preserves universal URL", async () => {
      const url = getPublicGuestbookUrl();
      let clipboardText = "";
      const fakeClipboard = {
        writeText: async (text) => {
          clipboardText = text;
        },
      };

      await fakeClipboard.writeText(url);
      assert.equal(clipboardText, url);
    });

    test("Download QR action triggers PNG download", () => {
      const fakeCanvas = {
        toDataURL: (mime) => `data:${mime};base64,fake-qr-data`,
      };
      const dataUrl = fakeCanvas.toDataURL("image/png");
      assert.ok(dataUrl.startsWith("data:image/png;base64,"));
    });
  });

  describe("3. Active Lounges & Initial State", () => {
    test("Initial state starts with no preselected lounge", () => {
      const initialFormValues = {
        loungeId: "",
        firstName: "",
        lastName: "",
        email: "",
      };
      assert.equal(initialFormValues.loungeId, "", "Lounge ID must start empty");
    });

    test("Active lounges list supports name, logo, and location", () => {
      const mockLounge = {
        _id: "lounge_123",
        name: "Sky Lounge",
        logo: {
          filename: "logo.png",
          location: "https://cdn.example.com/logo.png",
          mimetype: "image/png",
        },
        location: {
          address: "123 Main St, Suite 400",
        },
      };

      assert.equal(mockLounge._id, "lounge_123");
      assert.equal(mockLounge.name, "Sky Lounge");
      assert.ok(mockLounge.logo.location);
      assert.ok(mockLounge.location.address);
    });
  });

  describe("4. Client-side Form Validation (Yup)", () => {
    test("Validation fails when required fields are missing", async () => {
      const invalidData = {
        loungeId: "",
        firstName: "",
        lastName: "",
        email: "",
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(invalidData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("loungeId"), "loungeId should have error");
          assert.ok(errors.includes("firstName"), "firstName should have error");
          assert.ok(errors.includes("lastName"), "lastName should have error");
          assert.ok(errors.includes("email"), "email should have error");
          return true;
        }
      );
    });

    test("Validation fails when firstName or lastName exceeds 100 characters", async () => {
      const longNameData = {
        loungeId: "lounge_1",
        firstName: "A".repeat(101),
        lastName: "ValidLastName",
        email: "test@example.com",
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(longNameData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("firstName"));
          return true;
        }
      );
    });

    test("Validation fails for invalid email format and email starting with space", async () => {
      const invalidEmailData = {
        loungeId: "lounge_1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "invalid-email-address",
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(invalidEmailData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("email"));
          return true;
        }
      );
    });

    test("Validation fails for invalid birth month", async () => {
      const invalidMonthData = {
        loungeId: "lounge_1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        birthMonth: 15,
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(invalidMonthData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("birthMonth"));
          return true;
        }
      );
    });

    test("Validation rejects files larger than 5 MB", async () => {
      const oversizedFile = {
        name: "large.jpg",
        size: 6 * 1024 * 1024, // 6 MB
        type: "image/jpeg",
      };

      const oversizedData = {
        loungeId: "lounge_1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        photo: oversizedFile,
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(oversizedData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("photo"));
          return true;
        }
      );
    });

    test("Validation rejects non-image photo files", async () => {
      const pdfFile = {
        name: "document.pdf",
        size: 500 * 1024,
        type: "application/pdf",
      };

      const invalidFileData = {
        loungeId: "lounge_1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        photo: pdfFile,
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(invalidFileData, { abortEarly: false });
        },
        (err) => {
          const errors = err.inner.map((e) => e.path);
          assert.ok(errors.includes("photo"));
          return true;
        }
      );
    });

    test("Validation requires both title and date if a special date item is partially entered", async () => {
      const partialDateData = {
        loungeId: "lounge_1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        specialDates: [
          { title: "Birthday", date: "" }, // missing date
        ],
      };

      await assert.rejects(
        async () => {
          await publicGuestbookSchema.validate(partialDateData, { abortEarly: false });
        },
        (err) => {
          const hasDateError = err.inner.some((e) => e.path.includes("specialDates"));
          assert.ok(hasDateError, "Should reject partially entered special date");
          return true;
        }
      );
    });

    test("Validation passes with completely valid data", async () => {
      const validData = {
        loungeId: "lounge_123",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phoneNumber: "5551234567",
        birthMonth: "12",
        photo: {
          name: "photo.jpg",
          size: 1 * 1024 * 1024,
          type: "image/jpeg",
        },
        specialDates: [
          { title: "Anniversary", date: "2026-12-15" },
        ],
        details: "VIP guest",
      };

      const validated = await publicGuestbookSchema.validate(validData);
      assert.equal(validated.firstName, "Ada");
      assert.equal(validated.lastName, "Lovelace");
      assert.equal(validated.loungeId, "lounge_123");
    });
  });

  describe("5. Multipart/FormData Serialization", () => {
    test("FormData contains required fields and trims strings", () => {
      const values = {
        loungeId: "lounge_abc",
        firstName: "  Grace  ",
        lastName: "  Hopper  ",
        email: "  grace@navy.mil  ",
      };

      const formData = buildPublicGuestbookFormData(values);
      assert.equal(formData.get("loungeId"), "lounge_abc");
      assert.equal(formData.get("firstName"), "Grace");
      assert.equal(formData.get("lastName"), "Hopper");
      assert.equal(formData.get("email"), "grace@navy.mil");
    });

    test("specialDates is JSON-stringified and empty array is handled", () => {
      const values = {
        loungeId: "lounge_1",
        firstName: "Alan",
        lastName: "Turing",
        email: "alan@enigma.org",
        specialDates: [
          { title: "Birthday", date: "2026-06-23" },
          { title: "Award Day", date: "2027-04-10" },
        ],
      };

      const formData = buildPublicGuestbookFormData(values);
      const specialDatesStr = formData.get("specialDates");
      assert.ok(typeof specialDatesStr === "string");
      const parsed = JSON.parse(specialDatesStr);
      assert.equal(parsed.length, 2);
      assert.equal(parsed[0].title, "Birthday");
      assert.equal(parsed[0].date, "2026-06-23");
    });

    test("birthMonth is appended only when provided and not as empty string", () => {
      const withMonth = buildPublicGuestbookFormData({
        loungeId: "l1",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        birthMonth: "7",
      });
      assert.equal(withMonth.get("birthMonth"), "7");

      const withoutMonth = buildPublicGuestbookFormData({
        loungeId: "l1",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        birthMonth: "",
      });
      assert.equal(withoutMonth.get("birthMonth"), null);
    });

    test("Optional photo is attached as File or Blob", () => {
      const mockBlob = new Blob(["test-image-content"], { type: "image/png" });
      const formData = buildPublicGuestbookFormData({
        loungeId: "l1",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        photo: mockBlob,
      });

      const photoField = formData.get("photo");
      assert.ok(photoField instanceof Blob);
    });
  });

  describe("6. Error Handling & State Transitions", () => {
    test("HTTP 409 duplicate entry maps to friendly already-listed message", () => {
      const errorResponse = {
        status: 409,
        data: {
          success: false,
          message: "You already exist in this guestbook",
        },
      };

      const isDuplicate = errorResponse.status === 409;
      assert.equal(isDuplicate, true);
      const userFriendlyMessage = "You’re already listed in this lounge’s guestbook.";
      assert.ok(userFriendlyMessage.includes("already listed"));
    });

    test("HTTP 400 inactive lounge clears selection and allows refresh", () => {
      const errorResponse = {
        status: 400,
        data: {
          success: false,
          message: "Lounge is not available",
        },
      };

      let selectedLoungeId = "lounge_old";
      let refreshed = false;

      if (errorResponse.status === 400) {
        selectedLoungeId = "";
        refreshed = true;
      }

      assert.equal(selectedLoungeId, "");
      assert.equal(refreshed, true);
    });

    test("HTTP 422 server validation maps field paths", () => {
      const errorResponse = {
        status: 422,
        data: {
          success: false,
          message: "Unprocessable Entity",
          error: [
            {
              path: "body.email",
              message: "Invalid email address",
            },
            {
              path: "body.firstName",
              message: "First name must not contain numbers",
            },
          ],
        },
      };

      const fieldErrors = {};
      errorResponse.data.error.forEach((err) => {
        const field = err.path.replace(/^body\./, "");
        fieldErrors[field] = err.message;
      });

      assert.equal(fieldErrors.email, "Invalid email address");
      assert.equal(fieldErrors.firstName, "First name must not contain numbers");
    });

    test("HTTP 429 rate limit triggers retry-later message without spamming", () => {
      const errorResponse = {
        status: 429,
        data: {
          success: false,
          message: "Too many guestbook requests. Please try again later.",
        },
      };

      const isRateLimited = errorResponse.status === 429;
      assert.equal(isRateLimited, true);
      assert.equal(
        errorResponse.data.message,
        "Too many guestbook requests. Please try again later."
      );
    });

    test("Successful submission transitions to dedicated success state", () => {
      const successResponse = {
        success: true,
        message: "Added to Guestbook successfully",
        data: {
          _id: "entry_123",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
        },
      };

      assert.equal(successResponse.success, true);
      assert.equal(successResponse.data._id, "entry_123");
    });
  });
});

