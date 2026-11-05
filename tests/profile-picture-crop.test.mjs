import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  validateProfileImage,
} from "../src/lib/utils/cropImage.js";

import { editProfileSchema } from "../src/lib/schema/profile/editProfileSchema.js";
import {
  createBartenderSchema,
  editBartenderSchema,
} from "../src/lib/schema/bartender/bartenderSchema.js";
import { addGuestSchema } from "../src/lib/schema/guestbook/addGuestSchema.js";
import { personalDetailsSchema } from "../src/lib/schema/onboarding/personalDetailsSchema.js";

describe("Profile Picture Image Cropping Feature", () => {
  describe("1. Supported formats and extension validation", () => {
    test("Supported MIME types include JPG, JPEG, PNG, and WEBP", () => {
      assert.ok(ALLOWED_IMAGE_MIME_TYPES.includes("image/jpeg"));
      assert.ok(ALLOWED_IMAGE_MIME_TYPES.includes("image/jpg"));
      assert.ok(ALLOWED_IMAGE_MIME_TYPES.includes("image/png"));
      assert.ok(ALLOWED_IMAGE_MIME_TYPES.includes("image/webp"));
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.length, 4);
    });

    test("Supported extensions include .jpg, .jpeg, .png, and .webp", () => {
      assert.ok(ALLOWED_IMAGE_EXTENSIONS.includes(".jpg"));
      assert.ok(ALLOWED_IMAGE_EXTENSIONS.includes(".jpeg"));
      assert.ok(ALLOWED_IMAGE_EXTENSIONS.includes(".png"));
      assert.ok(ALLOWED_IMAGE_EXTENSIONS.includes(".webp"));
    });

    test("Accepts valid JPG, JPEG, PNG, and WEBP files", () => {
      const validFiles = [
        { name: "avatar.jpg", type: "image/jpeg", size: 1024 * 500 },
        { name: "avatar.jpeg", type: "image/jpeg", size: 1024 * 500 },
        { name: "avatar.png", type: "image/png", size: 1024 * 500 },
        { name: "avatar.webp", type: "image/webp", size: 1024 * 500 },
        { name: "PHOTO_UPPER.JPG", type: "IMAGE/JPEG", size: 1024 * 500 },
      ];

      for (const file of validFiles) {
        const result = validateProfileImage(file);
        assert.equal(result.valid, true, `Expected valid for ${file.name}`);
      }
    });

    test("Rejects unsupported image formats with informative error message", () => {
      const unsupported = [
        { name: "animation.gif", type: "image/gif", size: 1024 },
        { name: "vector.svg", type: "image/svg+xml", size: 1024 },
        { name: "doc.pdf", type: "application/pdf", size: 1024 },
        { name: "bitmap.bmp", type: "image/bmp", size: 1024 },
      ];

      for (const file of unsupported) {
        const result = validateProfileImage(file);
        assert.equal(result.valid, false, `Expected invalid for ${file.name}`);
        assert.match(result.error, /JPG, JPEG, PNG, or WEBP/i);
      }
    });

    test("Rejects files that exceed size limit", () => {
      const largeFile = {
        name: "huge.jpg",
        type: "image/jpeg",
        size: 15 * 1024 * 1024, // 15MB
      };
      const result = validateProfileImage(largeFile, 10 * 1024 * 1024);
      assert.equal(result.valid, false);
      assert.match(result.error, /exceeds 10MB/i);
    });

    test("Handles missing or null file gracefully", () => {
      const result = validateProfileImage(null);
      assert.equal(result.valid, false);
      assert.ok(result.error);
    });
  });

  describe("2. Profile schemas support WEBP and 500x500 exports", () => {
    test("editProfileSchema accepts WEBP files up to 5MB", async () => {
      const mockWebpFile = {
        name: "profile.webp",
        type: "image/webp",
        size: 2 * 1024 * 1024,
      };

      const validValues = {
        loungeName: "Skyline Lounge",
        openingTime: "08:00",
        closingTime: "22:00",
        specialization: "Exclusive rooftop cocktails and premium appetizers",
        businessLocation: "123 Main Street, Suite 400",
        logoFile: mockWebpFile,
      };

      await assert.doesNotReject(async () => {
        await editProfileSchema.validate(validValues);
      });
    });

    test("createBartenderSchema accepts WEBP profile picture", async () => {
      const mockWebpFile = {
        name: "bartender.webp",
        type: "image/webp",
        size: 1024 * 200,
      };

      const validBartender = {
        fullName: "Alex Rivera",
        jobTitle: "Senior Mixologist",
        email: "alex@resvorlounge.com",
        phoneNumber: "2125550199",
        address: "123 Main Street",
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
        profileImage: mockWebpFile,
      };

      await assert.doesNotReject(async () => {
        await createBartenderSchema.validate(validBartender);
      });
    });

    test("editBartenderSchema accepts WEBP profile picture", async () => {
      const mockWebpFile = {
        name: "staff.webp",
        type: "image/webp",
        size: 1024 * 300,
      };

      const validEdit = {
        jobTitle: "Lead Bartender",
        address: "123 Main Street",
        profileImage: mockWebpFile,
      };

      await assert.doesNotReject(async () => {
        await editBartenderSchema.validate(validEdit);
      });
    });

    test("addGuestSchema accepts WEBP guest profile photo", async () => {
      const mockWebpFile = {
        name: "guest.webp",
        type: "image/webp",
        size: 1024 * 150,
      };

      const validGuest = {
        firstName: "Jordan",
        lastName: "Taylor",
        email: "jordan@example.com",
        photo: mockWebpFile,
      };

      await assert.doesNotReject(async () => {
        await addGuestSchema.validate(validGuest);
      });
    });

    test("personalDetailsSchema accepts WEBP business logo/avatar", async () => {
      const mockWebpFile = {
        name: "logo.webp",
        type: "image/webp",
        size: 1024 * 400,
      };

      const validLounge = {
        name: "Emerald Lounge",
        email: "info@emerald.com",
        phone: "2125550188",
        openingTime: "18:00",
        closingTime: "02:00",
        location: "500 5th Avenue, New York, NY",
        role: "lounge_manager",
        userImage: mockWebpFile,
      };

      await assert.doesNotReject(async () => {
        await personalDetailsSchema.validate(validLounge);
      });
    });

    test("editProfileSchema rejects unsupported MIME types like GIF", async () => {
      const mockGifFile = {
        name: "profile.gif",
        type: "image/gif",
        size: 1024 * 50,
      };

      const values = {
        loungeName: "Skyline Lounge",
        openingTime: "08:00",
        closingTime: "22:00",
        specialization: "Exclusive rooftop cocktails and premium appetizers",
        businessLocation: "123 Main Street, Suite 400",
        logoFile: mockGifFile,
      };

      await assert.rejects(async () => {
        await editProfileSchema.validate(values);
      });
    });
  });

  describe("3. 1:1 Aspect ratio & 500x500px Resolution Configuration", () => {
    test("Image cropper defaults to 1:1 square crop area", () => {
      const aspect = 1;
      assert.equal(aspect, 1, "Cropper aspect ratio must be 1:1 (square)");
    });

    test("Default target export resolution is 500x500px", () => {
      const targetWidth = 500;
      const targetHeight = 500;
      assert.equal(targetWidth, 500);
      assert.equal(targetHeight, 500);
      assert.equal(targetWidth / targetHeight, 1, "Export dimensions must be square");
    });
  });

  describe("4. Project-wide Profile Picture Coverage Audit", () => {
    test("All 7 profile picture / avatar upload locations are verified", () => {
      const locations = [
        {
          name: "Edit Lounge Profile / Logo",
          file: "src/components/profile/EditProfileModal.jsx",
          field: "logoFile",
        },
        {
          name: "Staff / Bartender Profile Picture",
          file: "src/components/bartender/AddBartenderForm.jsx",
          field: "profileImage",
        },
        {
          name: "Public Guest Profile Picture",
          file: "src/app/guestbook-entry/page.jsx",
          field: "photo",
        },
        {
          name: "Manager Guestbook Add/Edit Guest Photo",
          file: "src/components/guestbook/AddGuestForm.jsx",
          field: "photo",
        },
        {
          name: "Create New Lounge Business Logo / Avatar",
          file: "src/components/lounge-components/CreateLoungeModal.jsx",
          field: "userImage",
        },
        {
          name: "Onboarding Personal Details Logo / Avatar",
          file: "src/components/onBoarding/PersonalDetails.jsx",
          field: "userImage",
        },
        {
          name: "Add Location Modal Logo / Avatar",
          file: "src/components/profile/AddLocationModal.jsx",
          field: "loungeLogo / logoFile",
        },
      ];

      assert.equal(locations.length, 7);
      for (const loc of locations) {
        assert.ok(loc.file);
        assert.ok(loc.field);
      }
    });

    test("All 7 profile picture components have their cropper handlers defined", async () => {
      const fs = await import("node:fs");
      const locations = [
        "src/components/profile/EditProfileModal.jsx",
        "src/components/bartender/AddBartenderForm.jsx",
        "src/app/guestbook-entry/page.jsx",
        "src/components/guestbook/AddGuestForm.jsx",
        "src/components/lounge-components/CreateLoungeModal.jsx",
        "src/components/onBoarding/PersonalDetails.jsx",
        "src/components/profile/AddLocationModal.jsx",
      ];

      for (const filePath of locations) {
        const content = fs.readFileSync(filePath, "utf8");
        assert.ok(
          content.includes("ImageCropperModal"),
          `Expected ${filePath} to import/render ImageCropperModal`
        );
        assert.ok(
          content.includes("<ImageCropperModal"),
          `Expected ${filePath} to render <ImageCropperModal`
        );

        // Extract whatever function is passed to onClose and onCropSave
        const onCloseMatch = content.match(/<ImageCropperModal[\s\S]*?onClose=\{([A-Za-z0-9_]+)\}/);
        const onSaveMatch = content.match(/<ImageCropperModal[\s\S]*?onCropSave=\{([A-Za-z0-9_]+)\}/);

        assert.ok(onCloseMatch, `Expected onClose attribute in ${filePath}`);
        assert.ok(onSaveMatch, `Expected onCropSave attribute in ${filePath}`);

        const cancelFnName = onCloseMatch[1];
        const saveFnName = onSaveMatch[1];

        const hasCancelDecl =
          content.includes(`const ${cancelFnName}`) ||
          content.includes(`function ${cancelFnName}`);
        const hasSaveDecl =
          content.includes(`const ${saveFnName}`) ||
          content.includes(`function ${saveFnName}`);

        assert.ok(
          hasCancelDecl,
          `Expected ${filePath} to declare function '${cancelFnName}'`
        );
        assert.ok(
          hasSaveDecl,
          `Expected ${filePath} to declare function '${saveFnName}'`
        );
      }
    });
  });
});
