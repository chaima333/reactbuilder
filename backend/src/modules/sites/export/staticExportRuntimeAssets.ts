import {
  existsSync,
  readFileSync,
} from "fs";
import {
  join,
  resolve,
} from "path";

type ViteManifestEntry = {
  file?: string;
  name?: string;
  src?: string;
  isEntry?: boolean;
  css?: string[];
  imports?: string[];
  dynamicImports?: string[];
};

type ViteManifest = Record<
  string,
  ViteManifestEntry
>;

export type StaticExportRuntimeAsset = {
  archivePath: string;
  publicPath: string;
  contentType: string;
  buffer: Buffer;
};

export type StaticExportRuntimeBundle = {
  visitorAuthRuntime: boolean;
  assets: StaticExportRuntimeAsset[];
  scriptPublicPaths: string[];
  stylesheetPublicPaths: string[];
};

const JS_CONTENT_TYPE =
  "text/javascript; charset=utf-8";

const CSS_CONTENT_TYPE =
  "text/css; charset=utf-8";

const normalizePublicPath = (
  value: string
) => `/${value.replace(/^\/+/, "")}`;

const getContentType = (
  file: string
) =>
  file.endsWith(".css")
    ? CSS_CONTENT_TYPE
    : JS_CONTENT_TYPE;

const getDefaultFrontendDistCandidates = () => [
  resolve(
    process.cwd(),
    "..",
    "frontend",
    "dist"
  ),
  resolve(
    process.cwd(),
    "frontend",
    "dist"
  ),
  resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "frontend",
    "dist"
  ),
];

export const getFrontendDistCandidates = () => {
  const configured =
    String(
      process.env
        .RB_STATIC_EXPORT_ASSETS_DIR || ""
    ).trim();

  return configured
    ? [
        resolve(configured),
        ...getDefaultFrontendDistCandidates(),
      ]
    : getDefaultFrontendDistCandidates();
};

const findFrontendDist = (
  candidates =
    getFrontendDistCandidates()
) =>
  candidates.find((candidate) =>
    existsSync(
      join(
        candidate,
        ".vite",
        "manifest.json"
      )
    )
  ) || null;

const readManifest = (
  distDir: string
): ViteManifest =>
  JSON.parse(
    readFileSync(
      join(
        distDir,
        ".vite",
        "manifest.json"
      ),
      "utf8"
    )
  );

const findVisitorAuthEntryKey = (
  manifest: ViteManifest
) =>
  Object.entries(manifest)
    .find(([key, entry]) =>
      entry.isEntry &&
      (
        key.includes(
          "visitorAuthRuntime"
        ) ||
        entry.src?.includes(
          "visitorAuthRuntime"
        ) ||
        entry.name ===
          "visitorAuthExportRuntime"
      )
    )?.[0] || null;

const collectManifestFiles = (
  manifest: ViteManifest,
  entryKey: string
) => {
  const files =
    new Set<string>();

  const visit = (
    key: string
  ) => {
    const entry =
      manifest[key];

    if (!entry) {
      return;
    }

    if (entry.file) {
      files.add(entry.file);
    }

    for (const css of entry.css || []) {
      files.add(css);
    }

    for (const importKey of [
      ...(entry.imports || []),
      ...(entry.dynamicImports || []),
    ]) {
      visit(importKey);
    }
  };

  visit(entryKey);

  return files;
};

export const loadVisitorAuthRuntimeBundle = (
  options: {
    enabled: boolean;
    distCandidates?: string[];
  }
): StaticExportRuntimeBundle => {
  if (!options.enabled) {
    return {
      visitorAuthRuntime: false,
      assets: [],
      scriptPublicPaths: [],
      stylesheetPublicPaths: [],
    };
  }

  const distDir =
    findFrontendDist(
      options.distCandidates
    );

  if (!distDir) {
    throw new Error(
      "Visitor auth export runtime assets were not found. Run the frontend build or set RB_STATIC_EXPORT_ASSETS_DIR."
    );
  }

  const manifest =
    readManifest(distDir);

  const entryKey =
    findVisitorAuthEntryKey(
      manifest
    );

  if (!entryKey) {
    throw new Error(
      "Visitor auth export runtime entry was not found in the frontend Vite manifest."
    );
  }

  const entry =
    manifest[entryKey];

  const files =
    collectManifestFiles(
      manifest,
      entryKey
    );

  const assets =
    Array.from(files)
      .sort()
      .map((file) => ({
        archivePath:
          file,
        publicPath:
          normalizePublicPath(file),
        contentType:
          getContentType(file),
        buffer:
          readFileSync(
            join(
              distDir,
              file
            )
          ),
      }));

  return {
    visitorAuthRuntime: true,
    assets,
    scriptPublicPaths:
      entry.file
        ? [
            normalizePublicPath(
              entry.file
            ),
          ]
        : [],
    stylesheetPublicPaths:
      (entry.css || []).map(
        normalizePublicPath
      ),
  };
};

const escapeJsonForHtml = (
  value: unknown
) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/=/g, "\\u003d")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export const injectStaticExportRuntime = (
  html: string,
  runtime: StaticExportRuntimeBundle,
  config: Record<string, unknown>
) => {
  if (
    !runtime.visitorAuthRuntime
  ) {
    return html;
  }

  const styles =
    runtime.stylesheetPublicPaths
      .map(
        (href) =>
          `<link rel="stylesheet" href="${href}" data-rb-export-runtime-style />`
      )
      .join("\n");

  const scripts =
    runtime.scriptPublicPaths
      .map(
        (src) =>
          `<script type="module" src="${src}" data-rb-export-runtime-script></script>`
      )
      .join("\n");

  const snippet = `
${styles}
<script data-rb-export-runtime-config>
  window.__RB_EXPORT_RUNTIME_CONFIG__ = ${escapeJsonForHtml(
    config
  )};
</script>
${scripts}`;

  return html.includes("</body>")
    ? html.replace(
        "</body>",
        `${snippet}\n</body>`
      )
    : `${html}${snippet}`;
};
