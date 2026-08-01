import archiver from "archiver";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  ZIP_IMPORT_MAX_COMPRESSION_RATIO,
  ZIP_IMPORT_MAX_ENTRIES,
  ZIP_IMPORT_MAX_TOTAL_UNCOMPRESSED_BYTES,
  ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE,
  ZipImportValidationError,
  cleanupImportPath,
  extractValidatedZip,
  normalizeArchivePath,
  validateZipUploadFile
} from "./zipImportSecurity";

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
        "zip-import-security-test-"
      )
    );

  tempRoots.push(root);

  return root;
};

const makeZip = async (
  entries: ZipEntryFixture[],
  fileName = "website.zip",
  options: {
    store?: boolean;
  } = {}
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
          options.store
            ? {
                store: true
              }
            : {
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

const makeMulterFile = (
  filePath: string,
  overrides: Partial<{
    originalname: string;
    mimetype: string;
  }> = {}
) => ({
  path:
    filePath,
  originalname:
    overrides.originalname ||
    path.basename(filePath),
  mimetype:
    overrides.mimetype ||
    "application/zip"
});

const expectZipCode = async (
  zipPath: string,
  code: string
) => {
  await expect(
    extractValidatedZip(zipPath)
  ).rejects.toMatchObject({
    code
  });
};

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    cleanupImportPath(root);
  }
});

describe("ZIP import security validation", () => {
  it("extracts a valid multi-page ZIP and preserves relative paths", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content: "<h1>Home</h1>"
        },
        {
          name: "pages/about.html",
          content: "<h1>About</h1>"
        },
        {
          name: "assets/site.css",
          content: "body { color: black; }"
        }
      ]);

    validateZipUploadFile(
      makeMulterFile(zipPath)
    );

    const result =
      await extractValidatedZip(zipPath);

    try {
      const relativeFiles =
        result.files
          .map(file =>
            path
              .relative(
                result.extractDir,
                file
              )
              .replace(/\\/g, "/")
          )
          .sort();

      expect(relativeFiles).toEqual([
        "assets/site.css",
        "index.html",
        "pages/about.html"
      ]);
    } finally {
      cleanupImportPath(result.extractDir);
    }
  });

  it("rejects ../ traversal", () => {
    expect(() =>
      normalizeArchivePath("../evil.html")
    ).toThrowError(
      ZipImportValidationError
    );
  });

  it("rejects backslash traversal", () => {
    expect(() =>
      normalizeArchivePath("..\\evil.html")
    ).toThrowError(
      ZipImportValidationError
    );
  });

  it("rejects absolute POSIX paths", () => {
    expect(() =>
      normalizeArchivePath("/tmp/evil.html")
    ).toThrowError(
      ZipImportValidationError
    );
  });

  it("rejects Windows drive paths", () => {
    expect(() =>
      normalizeArchivePath("C:\\temp\\evil.html")
    ).toThrowError(
      ZipImportValidationError
    );
  });

  it("rejects duplicate normalized paths", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content: "a"
        },
        {
          name: "./index.html",
          content: "b"
        }
      ]);

    await expectZipCode(
      zipPath,
      "ZIP_ENTRY_DUPLICATE_PATH"
    );
  });

  it("rejects symlink entries", async () => {
    const root =
      makeTempRoot();

    const zipPath =
      path.join(
        root,
        "symlink.zip"
      );

    await new Promise<void>(
      (
        resolve,
        reject
      ) => {
        const output =
          fs.createWriteStream(zipPath);

        const archive =
          archiver("zip");

        output.on(
          "close",
          resolve
        );

        archive.on(
          "error",
          reject
        );

        archive.pipe(output);
        archive.symlink(
          "link.html",
          "index.html"
        );
        archive.finalize();
      }
    );

    await expectZipCode(
      zipPath,
      "ZIP_ENTRY_TYPE_UNSUPPORTED"
    );
  });

  it("rejects nested archive entries", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content: "<h1>Home</h1>"
        },
        {
          name: "assets/inner.zip",
          content: "not really a zip"
        }
      ]);

    await expectZipCode(
      zipPath,
      "ZIP_NESTED_ARCHIVE"
    );
  });

  it("rejects too many files", async () => {
    const entries =
      Array.from(
        {
          length:
            ZIP_IMPORT_MAX_ENTRIES + 1
        },
        (_unused, index) => ({
          name:
            `pages/${index}.html`,
          content:
            "<h1>x</h1>"
        })
      );

    const zipPath =
      await makeZip(
        entries,
        "website.zip",
        {
          store: true
        }
      );

    await expectZipCode(
      zipPath,
      "ZIP_TOO_MANY_FILES"
    );
  });

  it("rejects excessive per-file uncompressed size", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content:
            Buffer.alloc(
              ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE + 1,
              "a"
            )
        }
      ]);

    await expectZipCode(
      zipPath,
      "ZIP_ENTRY_TOO_LARGE"
    );
  });

  it("rejects excessive total uncompressed size", async () => {
    const perFileSize =
      Math.floor(
        ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE / 2
      );

    const fileCount =
      Math.floor(
        ZIP_IMPORT_MAX_TOTAL_UNCOMPRESSED_BYTES /
          perFileSize
      ) + 1;

    const entries =
      Array.from(
        {
          length:
            fileCount
        },
        (_unused, index) => ({
          name:
            `pages/${index}.html`,
          content:
            crypto.randomBytes(
              perFileSize,
            )
        })
      );

    const zipPath =
      await makeZip(entries);

    await expectZipCode(
      zipPath,
      "ZIP_TOTAL_UNCOMPRESSED_TOO_LARGE"
    );
  });

  it("rejects excessive compression ratio", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content:
            Buffer.alloc(
              ZIP_IMPORT_MAX_COMPRESSION_RATIO * 4096,
              "a"
            )
        }
      ]);

    await expectZipCode(
      zipPath,
      "ZIP_COMPRESSION_RATIO_TOO_HIGH"
    );
  });

  it("rejects invalid ZIP signature", () => {
    const root =
      makeTempRoot();

    const filePath =
      path.join(
        root,
        "not.zip"
      );

    fs.writeFileSync(
      filePath,
      "not a zip"
    );

    expect(() =>
      validateZipUploadFile(
        makeMulterFile(filePath)
      )
    ).toThrowError(
      expect.objectContaining({
        code: "ZIP_INVALID_SIGNATURE"
      })
    );
  });

  it("rejects wrong extension", async () => {
    const zipPath =
      await makeZip(
        [
          {
            name: "index.html",
            content: "<h1>Home</h1>"
          }
        ],
        "website.html"
      );

    expect(() =>
      validateZipUploadFile(
        makeMulterFile(
          zipPath,
          {
            originalname: "website.html"
          }
        )
      )
    ).toThrowError(
      expect.objectContaining({
        code: "ZIP_INVALID_EXTENSION"
      })
    );
  });

  it("rejects malformed ZIP files", async () => {
    const root =
      makeTempRoot();

    const filePath =
      path.join(
        root,
        "malformed.zip"
      );

    fs.writeFileSync(
      filePath,
      Buffer.from([
        0x50,
        0x4b,
        0x03,
        0x04,
        0x00
      ])
    );

    await expectZipCode(
      filePath,
      "ZIP_MALFORMED"
    );
  });

  it("cleans extraction directory after extraction failure", async () => {
    const zipPath =
      await makeZip([
        {
          name: "index.html",
          content: "<h1>Home</h1>"
        }
      ]);

    const originalCreateWriteStream =
      fs.createWriteStream;

    let attemptedPath = "";

    fs.createWriteStream = ((
      filePath: fs.PathLike,
      options?: any
    ) => {
      attemptedPath =
        String(filePath);

      const stream =
        originalCreateWriteStream(
          filePath,
          options
        );

      process.nextTick(() =>
        stream.destroy(
          new Error("forced write failure")
        )
      );

      return stream;
    }) as typeof fs.createWriteStream;

    try {
      await expect(
        extractValidatedZip(zipPath)
      ).rejects.toThrow(
        "forced write failure"
      );
    } finally {
      fs.createWriteStream =
        originalCreateWriteStream;
    }

    expect(attemptedPath).not.toBe("");
    expect(
      fs.existsSync(
        path.dirname(attemptedPath)
      )
    ).toBe(false);
  });
});
