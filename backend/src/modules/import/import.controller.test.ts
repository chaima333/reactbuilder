import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import archiver from "archiver";
import fs from "fs";
import os from "os";
import path from "path";

import {
  makeSafeImportedPageSlug
} from "./importedPageIdentity";

import {
  cleanupImportPath
} from "./zipImportSecurity";

vi.mock(
  "../media/media.service",
  () => ({
    MediaService: {
      processUpload:
        vi.fn()
    }
  })
);

import {
  MediaService
} from "../media/media.service";

import {
  importHtmlZip
} from "./import.controller";

type ZipEntryFixture = {
  name: string;
  content: string | Buffer;
};

const tempRoots: string[] = [];

const makeTempRoot = () => {
  const root =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        "html-zip-controller-test-"
      )
    );

  tempRoots.push(root);

  return root;
};

const makeZip = async (
  entries: ZipEntryFixture[],
  fileName = "website.zip"
) => {
  const root =
    makeTempRoot();

  const zipPath =
    path.join(
      root,
      fileName
    );

  await new Promise<void>(
    (
      resolve,
      reject
    ) => {
      const output =
        fs.createWriteStream(zipPath);

      const archive =
        archiver(
          "zip",
          {
            zlib: {
              level: 9
            }
          }
        );

      output.on(
        "close",
        resolve
      );

      archive.on(
        "error",
        reject
      );

      archive.pipe(output);

      for (const entry of entries) {
        archive.append(
          entry.content,
          {
            name:
              entry.name
          }
        );
      }

      archive.finalize();
    }
  );

  return zipPath;
};

const makeRequest = (
  zipPath: string,
  overrides: Record<string, unknown> = {}
) => ({
  file: {
    path:
      zipPath,
    filename:
      path.basename(zipPath),
    originalname:
      path.basename(zipPath),
    mimetype:
      "application/zip"
  },
  params: {
    siteId:
      "123"
  },
  user: {
    id:
      "456"
  },
  ...overrides
});

const makeResponse = () => {
  const response = {
    status:
      vi.fn(),
    json:
      vi.fn()
  };

  response.status.mockReturnValue(
    response
  );

  response.json.mockReturnValue(
    response
  );

  return response;
};

const listImportExtractDirs = () =>
  fs
    .readdirSync(
      os.tmpdir(),
      {
        withFileTypes: true
      }
    )
    .filter(entry =>
      entry.isDirectory() &&
      entry.name.startsWith(
        "reactbuilder-import-"
      ) &&
      !entry.name.startsWith(
        "reactbuilder-import-uploads"
      )
    )
    .map(entry => entry.name)
    .sort();

afterEach(() => {
  vi.clearAllMocks();

  for (const root of tempRoots.splice(0)) {
    cleanupImportPath(root);
  }
});

describe("HTML ZIP import page identity", () => {
  it("keeps client-portal as a normal imported page slug", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal");
  });

  it("keeps imported login/register pages separate from system pages", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "login",
        usedSlugs
      )
    ).toBe("login-imported");

    expect(
      makeSafeImportedPageSlug(
        "register",
        usedSlugs
      )
    ).toBe("register-imported");
  });

  it("deduplicates imported page slugs deterministically", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal");

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal-2");
  });
});

describe("HTML ZIP import controller security", () => {
  it("returns ZIP_NO_HTML_FILES and cleans the upload for ZIPs without HTML", async () => {
    const zipPath =
      await makeZip([
        {
          name:
            "assets/site.css",
          content:
            "body { color: black; }"
        }
      ]);

    const res =
      makeResponse();

    await importHtmlZip(
      makeRequest(zipPath),
      res
    );

    expect(res.status).toHaveBeenCalledWith(
      422
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "ZIP_NO_HTML_FILES",
        message:
          "The ZIP does not contain any HTML files"
      })
    );
    expect(
      fs.existsSync(zipPath)
    ).toBe(false);
    expect(
      MediaService.processUpload
    ).not.toHaveBeenCalled();
  });

  it("returns safe JSON without stack for malformed ZIPs", async () => {
    const root =
      makeTempRoot();

    const zipPath =
      path.join(
        root,
        "malformed.zip"
      );

    fs.writeFileSync(
      zipPath,
      Buffer.from([
        0x50,
        0x4b,
        0x03,
        0x04,
        0x00
      ])
    );

    const res =
      makeResponse();

    await importHtmlZip(
      makeRequest(zipPath),
      res
    );

    expect(res.status).toHaveBeenCalledWith(
      400
    );
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: "ZIP_MALFORMED",
      message:
        "The uploaded ZIP archive could not be read."
    });
    expect(
      JSON.stringify(
        res.json.mock.calls[0][0]
      )
    ).not.toContain("stack");
    expect(
      fs.existsSync(zipPath)
    ).toBe(false);
  });

  it("cleans the upload file after validation failure and skips media upload", async () => {
    const root =
      makeTempRoot();

    const zipPath =
      path.join(
        root,
        "not-a-zip.zip"
      );

    fs.writeFileSync(
      zipPath,
      "not a zip"
    );

    const res =
      makeResponse();

    await importHtmlZip(
      makeRequest(zipPath),
      res
    );

    expect(res.status).toHaveBeenCalledWith(
      400
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "ZIP_INVALID_SIGNATURE"
      })
    );
    expect(
      fs.existsSync(zipPath)
    ).toBe(false);
    expect(
      MediaService.processUpload
    ).not.toHaveBeenCalled();
  });

  it("cleans the extraction directory after successful import preparation", async () => {
    const before =
      listImportExtractDirs();

    const zipPath =
      await makeZip([
        {
          name:
            "index.html",
          content:
            "<html><body><h1>Home</h1></body></html>"
        },
        {
          name:
            "pages/about.html",
          content:
            "<html><body><h1>About</h1></body></html>"
        }
      ]);

    const res =
      makeResponse();

    await importHtmlZip(
      makeRequest(zipPath),
      res
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        pages:
          expect.arrayContaining([
            expect.objectContaining({
              slug:
                "home"
            }),
            expect.objectContaining({
              slug:
                "about"
            })
          ])
      })
    );
    expect(
      fs.existsSync(zipPath)
    ).toBe(false);
    expect(
      listImportExtractDirs()
    ).toEqual(before);
  });
});
