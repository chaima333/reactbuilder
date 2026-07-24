import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
} from "fs";
import {
  tmpdir,
} from "os";
import {
  join,
} from "path";
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  injectStaticExportRuntime,
  loadVisitorAuthRuntimeBundle,
} from "./staticExportRuntimeAssets";

const createRuntimeDist = () => {
  const dist =
    mkdtempSync(
      join(
        tmpdir(),
        "rb-export-runtime-"
      )
    );

  mkdirSync(
    join(dist, ".vite"),
    {
      recursive: true,
    }
  );

  mkdirSync(
    join(dist, "assets"),
    {
      recursive: true,
    }
  );

  writeFileSync(
    join(
      dist,
      "assets",
      "visitorAuthExportRuntime.js"
    ),
    "import './chunk.js';",
    "utf8"
  );

  writeFileSync(
    join(
      dist,
      "assets",
      "chunk.js"
    ),
    "export {};",
    "utf8"
  );

  writeFileSync(
    join(
      dist,
      "assets",
      "visitorAuthExportRuntime.css"
    ),
    ".rb-export-runtime-block{}",
    "utf8"
  );

  writeFileSync(
    join(
      dist,
      ".vite",
      "manifest.json"
    ),
    JSON.stringify({
      "src/modules/pageBuilder/export/visitorAuthRuntime.tsx": {
        file:
          "assets/visitorAuthExportRuntime.js",
        name:
          "visitorAuthExportRuntime",
        src:
          "src/modules/pageBuilder/export/visitorAuthRuntime.tsx",
        isEntry:
          true,
        imports: [
          "_chunk.js",
        ],
        css: [
          "assets/visitorAuthExportRuntime.css",
        ],
      },
      "_chunk.js": {
        file:
          "assets/chunk.js",
      },
    }),
    "utf8"
  );

  return dist;
};

describe("static export runtime assets", () => {
  it("does not include visitorAuth runtime when it is not required", () => {
    const bundle =
      loadVisitorAuthRuntimeBundle({
        enabled: false,
      });

    expect(bundle).toEqual({
      visitorAuthRuntime: false,
      assets: [],
      scriptPublicPaths: [],
      stylesheetPublicPaths: [],
    });
  });

  it("loads visitorAuth runtime assets from the Vite manifest when required", () => {
    const dist =
      createRuntimeDist();

    const bundle =
      loadVisitorAuthRuntimeBundle({
        enabled: true,
        distCandidates: [
          dist,
        ],
      });

    expect(
      bundle.visitorAuthRuntime
    ).toBe(true);
    expect(
      bundle.scriptPublicPaths
    ).toEqual([
      "/assets/visitorAuthExportRuntime.js",
    ]);
    expect(
      bundle.stylesheetPublicPaths
    ).toEqual([
      "/assets/visitorAuthExportRuntime.css",
    ]);
    expect(
      bundle.assets.map(
        (asset) =>
          asset.archivePath
      )
    ).toEqual([
      "assets/chunk.js",
      "assets/visitorAuthExportRuntime.css",
      "assets/visitorAuthExportRuntime.js",
    ]);
  });

  it("injects escaped runtime config and module scripts", () => {
    const html =
      injectStaticExportRuntime(
        "<html><body><main></main></body></html>",
        {
          visitorAuthRuntime: true,
          assets: [],
          scriptPublicPaths: [
            "/assets/runtime.js",
          ],
          stylesheetPublicPaths: [
            "/assets/runtime.css",
          ],
        },
        {
          siteId: 42,
          apiBaseUrl:
            'https://api.example.test/api"</script><img src=x>',
          enabledCapabilities: [
            "visitorAuth",
          ],
        }
      );

    expect(html).toContain(
      'rel="stylesheet"'
    );
    expect(html).toContain(
      'type="module"'
    );
    expect(html).toContain(
      "window.__RB_EXPORT_RUNTIME_CONFIG__"
    );
    expect(html).not.toContain(
      '</script><img src=x>'
    );
    expect(html).toContain(
      "\\u003c/script\\u003e"
    );
  });
});
