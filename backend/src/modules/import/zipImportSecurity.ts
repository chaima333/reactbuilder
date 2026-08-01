import fs from "fs";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import unzipper from "unzipper";

export const ZIP_IMPORT_MAX_ENTRIES =
  500;

export const ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE =
  10 * 1024 * 1024;

export const ZIP_IMPORT_MAX_TOTAL_UNCOMPRESSED_BYTES =
  100 * 1024 * 1024;

export const ZIP_IMPORT_MAX_COMPRESSION_RATIO =
  100;

const ZIP_UPLOAD_MIME_TYPES =
  new Set([
    "application/zip",
    "application/x-zip-compressed",
    "multipart/x-zip",
    "application/octet-stream"
  ]);

const NESTED_ARCHIVE_EXTENSIONS =
  new Set([
    ".zip",
    ".jar",
    ".7z",
    ".rar",
    ".gz",
    ".tar",
    ".tgz"
  ]);

const ZIP_LOCAL_FILE_HEADER_SIGNATURE =
  0x04034b50;

const ZIP_EMPTY_ARCHIVE_SIGNATURE =
  0x06054b50;

const ZIP_SPANNED_ARCHIVE_SIGNATURE =
  0x08074b50;

export type ZipImportErrorCode =
  | "HTML_ZIP_UPLOAD_INVALID"
  | "ZIP_INVALID_EXTENSION"
  | "ZIP_INVALID_MIME_TYPE"
  | "ZIP_INVALID_SIGNATURE"
  | "ZIP_MALFORMED"
  | "ZIP_TOO_MANY_FILES"
  | "ZIP_ENTRY_PATH_UNSAFE"
  | "ZIP_ENTRY_DUPLICATE_PATH"
  | "ZIP_ENTRY_TYPE_UNSUPPORTED"
  | "ZIP_NESTED_ARCHIVE"
  | "ZIP_ENTRY_TOO_LARGE"
  | "ZIP_TOTAL_UNCOMPRESSED_TOO_LARGE"
  | "ZIP_COMPRESSION_RATIO_TOO_HIGH";

export class ZipImportValidationError extends Error {
  statusCode: number;
  code: ZipImportErrorCode;

  constructor(
    code: ZipImportErrorCode,
    message: string,
    statusCode = 422
  ) {
    super(message);
    this.name = "ZipImportValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

type MulterFileLike = {
  path: string;
  originalname?: string;
  mimetype?: string;
};

type ZipDirectoryEntry = {
  path: string;
  type?: string;
  uncompressedSize?: number;
  compressedSize?: number;
  externalFileAttributes?: number;
  stream: () => NodeJS.ReadableStream;
};

type ValidatedZipEntry = {
  archivePath: string;
  normalizedPath: string;
  entry: ZipDirectoryEntry;
};

type ExtractValidatedZipResult = {
  extractDir: string;
  files: string[];
};

const makeValidationError = (
  code: ZipImportErrorCode,
  message: string,
  statusCode = 422
) =>
  new ZipImportValidationError(
    code,
    message,
    statusCode
  );

export const isZipImportValidationError = (
  error: unknown
): error is ZipImportValidationError =>
  error instanceof ZipImportValidationError;

export const cleanupImportPath = (
  targetPath: string | undefined
) => {
  if (!targetPath) {
    return;
  }

  fs.rmSync(
    targetPath,
    {
      recursive: true,
      force: true
    }
  );
};

export const createZipUploadTempDir = () => {
  const uploadRoot =
    path.join(
      os.tmpdir(),
      "reactbuilder-import-uploads"
    );

  fs.mkdirSync(
    uploadRoot,
    {
      recursive: true
    }
  );

  return uploadRoot;
};

const readZipSignature = (
  filePath: string
) => {
  const fd =
    fs.openSync(
      filePath,
      "r"
    );

  try {
    const buffer =
      Buffer.alloc(4);

    const bytesRead =
      fs.readSync(
        fd,
        buffer,
        0,
        buffer.length,
        0
      );

    if (bytesRead < 4) {
      throw makeValidationError(
        "ZIP_INVALID_SIGNATURE",
        "The uploaded file is not a valid ZIP archive.",
        400
      );
    }

    return buffer.readUInt32LE(0);
  } finally {
    fs.closeSync(fd);
  }
};

export const validateZipUploadFile = (
  file: MulterFileLike
) => {
  const originalName =
    file.originalname || "";

  if (
    path.extname(originalName).toLowerCase() !==
    ".zip"
  ) {
    throw makeValidationError(
      "ZIP_INVALID_EXTENSION",
      "Only .zip files can be imported.",
      400
    );
  }

  const mimeType =
    (file.mimetype || "").toLowerCase();

  if (
    mimeType &&
    !ZIP_UPLOAD_MIME_TYPES.has(mimeType)
  ) {
    throw makeValidationError(
      "ZIP_INVALID_MIME_TYPE",
      "The uploaded file type is not allowed for ZIP import.",
      400
    );
  }

  const signature =
    readZipSignature(file.path);

  if (
    signature !== ZIP_LOCAL_FILE_HEADER_SIGNATURE &&
    signature !== ZIP_EMPTY_ARCHIVE_SIGNATURE &&
    signature !== ZIP_SPANNED_ARCHIVE_SIGNATURE
  ) {
    throw makeValidationError(
      "ZIP_INVALID_SIGNATURE",
      "The uploaded file is not a valid ZIP archive.",
      400
    );
  }
};

const getEntryMode = (
  entry: ZipDirectoryEntry
) =>
  ((entry.externalFileAttributes || 0) >>> 16) &
  0xffff;

const isSymlinkMode = (
  mode: number
) =>
  (mode & 0o170000) === 0o120000;

const hasUnsupportedSpecialMode = (
  mode: number
) => {
  if (!mode) {
    return false;
  }

  const fileType =
    mode & 0o170000;

  return ![
    0o000000,
    0o040000,
    0o100000
  ].includes(fileType);
};

export const normalizeArchivePath = (
  archivePath: string
) => {
  const rawPath =
    String(archivePath || "").trim();

  if (!rawPath) {
    throw makeValidationError(
      "ZIP_ENTRY_PATH_UNSAFE",
      "The ZIP contains an unsafe file path."
    );
  }

  if (
    rawPath.startsWith("/") ||
    rawPath.startsWith("\\") ||
    rawPath.startsWith("//") ||
    rawPath.startsWith("\\\\") ||
    /^[a-zA-Z]:/.test(rawPath)
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_PATH_UNSAFE",
      "The ZIP contains an unsafe file path."
    );
  }

  const normalizedSeparators =
    rawPath.replace(/\\/g, "/");

  if (
    normalizedSeparators.startsWith("/") ||
    normalizedSeparators.startsWith("//")
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_PATH_UNSAFE",
      "The ZIP contains an unsafe file path."
    );
  }

  const normalized =
    path
      .posix
      .normalize(normalizedSeparators)
      .replace(/^(\.\/)+/, "");

  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_PATH_UNSAFE",
      "The ZIP contains an unsafe file path."
    );
  }

  return normalized;
};

const ensureEntryTypeIsSupported = (
  entry: ZipDirectoryEntry
) => {
  const mode =
    getEntryMode(entry);

  if (
    isSymlinkMode(mode) ||
    hasUnsupportedSpecialMode(mode)
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_TYPE_UNSUPPORTED",
      "The ZIP contains unsupported file entry types."
    );
  }

  if (
    entry.type !== "File" &&
    entry.type !== "Directory"
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_TYPE_UNSUPPORTED",
      "The ZIP contains unsupported file entry types."
    );
  }
};

const validateEntrySizes = (
  entry: ZipDirectoryEntry,
  totalUncompressedBytes: number
) => {
  const uncompressedSize =
    Number(entry.uncompressedSize || 0);

  const compressedSize =
    Number(entry.compressedSize || 0);

  if (
    !Number.isFinite(uncompressedSize) ||
    uncompressedSize < 0 ||
    uncompressedSize >
      ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_TOO_LARGE",
      "A ZIP entry exceeds the maximum allowed uncompressed size."
    );
  }

  if (
    totalUncompressedBytes >
    ZIP_IMPORT_MAX_TOTAL_UNCOMPRESSED_BYTES
  ) {
    throw makeValidationError(
      "ZIP_TOTAL_UNCOMPRESSED_TOO_LARGE",
      "The ZIP exceeds the maximum allowed total uncompressed size."
    );
  }

  if (
    compressedSize > 0 &&
    uncompressedSize / compressedSize >
      ZIP_IMPORT_MAX_COMPRESSION_RATIO
  ) {
    throw makeValidationError(
      "ZIP_COMPRESSION_RATIO_TOO_HIGH",
      "The ZIP compression ratio is too high."
    );
  }
};

const validateZipEntries = (
  entries: ZipDirectoryEntry[]
) => {
  if (
    entries.length >
    ZIP_IMPORT_MAX_ENTRIES
  ) {
    throw makeValidationError(
      "ZIP_TOO_MANY_FILES",
      "The ZIP contains too many entries."
    );
  }

  const seenPaths =
    new Set<string>();

  const validatedEntries:
    ValidatedZipEntry[] = [];

  let totalUncompressedBytes =
    0;

  for (const entry of entries) {
    ensureEntryTypeIsSupported(entry);

    const normalizedPath =
      normalizeArchivePath(entry.path);

    const duplicateKey =
      normalizedPath.toLowerCase();

    if (seenPaths.has(duplicateKey)) {
      throw makeValidationError(
        "ZIP_ENTRY_DUPLICATE_PATH",
        "The ZIP contains duplicate file paths."
      );
    }

    seenPaths.add(duplicateKey);

    if (entry.type === "Directory") {
      continue;
    }

    const extension =
      path
        .posix
        .extname(normalizedPath)
        .toLowerCase();

    if (NESTED_ARCHIVE_EXTENSIONS.has(extension)) {
      throw makeValidationError(
        "ZIP_NESTED_ARCHIVE",
        "Nested archives are not allowed in ZIP imports."
      );
    }

    totalUncompressedBytes +=
      Number(entry.uncompressedSize || 0);

    validateEntrySizes(
      entry,
      totalUncompressedBytes
    );

    validatedEntries.push({
      archivePath:
        entry.path,
      normalizedPath,
      entry
    });
  }

  return validatedEntries;
};

const ensureInsideDirectory = (
  baseDir: string,
  candidatePath: string
) => {
  const relative =
    path.relative(
      baseDir,
      candidatePath
    );

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw makeValidationError(
      "ZIP_ENTRY_PATH_UNSAFE",
      "The ZIP contains an unsafe file path."
    );
  }
};

const createExtractDir = () =>
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "reactbuilder-import-"
    )
  );

const openZipDirectory = async (
  zipPath: string
) => {
  try {
    return await unzipper.Open.file(zipPath);
  } catch (_error) {
    throw makeValidationError(
      "ZIP_MALFORMED",
      "The uploaded ZIP archive could not be read.",
      400
    );
  }
};

export const extractValidatedZip = async (
  zipPath: string
): Promise<ExtractValidatedZipResult> => {
  const directory =
    await openZipDirectory(zipPath);

  const entries =
    validateZipEntries(
      directory.files as ZipDirectoryEntry[]
    );

  const extractDir =
    createExtractDir();

  const files: string[] = [];
  let actualTotalUncompressedBytes =
    0;

  try {
    for (const entry of entries) {
      const destination =
        path.join(
          extractDir,
          ...entry.normalizedPath.split("/")
        );

      ensureInsideDirectory(
        extractDir,
        destination
      );

      fs.mkdirSync(
        path.dirname(destination),
        {
          recursive: true
        }
      );

      await pipeline(
        entry.entry.stream(),
        fs.createWriteStream(
          destination,
          {
            flags: "wx"
          }
        )
      );

      const stat =
        fs.statSync(destination);

      if (
        stat.size >
        ZIP_IMPORT_MAX_UNCOMPRESSED_BYTES_PER_FILE
      ) {
        throw makeValidationError(
          "ZIP_ENTRY_TOO_LARGE",
          "A ZIP entry exceeds the maximum allowed uncompressed size."
        );
      }

      actualTotalUncompressedBytes +=
        stat.size;

      if (
        actualTotalUncompressedBytes >
        ZIP_IMPORT_MAX_TOTAL_UNCOMPRESSED_BYTES
      ) {
        throw makeValidationError(
          "ZIP_TOTAL_UNCOMPRESSED_TOO_LARGE",
          "The ZIP exceeds the maximum allowed total uncompressed size."
        );
      }

      files.push(destination);
    }

    return {
      extractDir,
      files
    };
  } catch (error) {
    cleanupImportPath(extractDir);
    throw error;
  }
};
