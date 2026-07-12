import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bundleStaticExportMedia,
  collectMediaUrlsFromHtml,
  isSafePublicMediaUrl,
  rewriteMediaUrlsInHtml,
} from "./export.controller";

describe("static export media bundling", () => {
  it("downloads repeated image URLs once and rewrites image blocks", async () => {
    const remote =
      "https://cdn.example.com/logo.png";

    let calls =
      0;

    const bundle =
      await bundleStaticExportMedia(
        {
          "index.html": `
            <img src="${remote}" />
            <img src="${remote}" />
          `,
        },
        async () => {
          calls += 1;

          return {
            contentType:
              "image/png",
            buffer:
              Buffer.from("png"),
          };
        }
      );

    expect(calls).toBe(1);
    expect(bundle.assets).toHaveLength(1);

    const rewritten =
      rewriteMediaUrlsInHtml(
        `<img src="${remote}" />`,
        bundle.urlMap
      );

    expect(rewritten).toContain('src="/assets/');
    expect(rewritten).not.toContain(remote);
  });

  it("rewrites CSS background URLs", async () => {
    const remote =
      "https://cdn.example.com/hero.webp";

    const html =
      `<style>.hero{background-image:url("${remote}")}</style>`;

    const bundle =
      await bundleStaticExportMedia(
        {
          "index.html":
            html,
        },
        async () => ({
          contentType:
            "image/webp",
          buffer:
            Buffer.from("webp"),
        })
      );

    const rewritten =
      rewriteMediaUrlsInHtml(
        html,
        bundle.urlMap
      );

    expect(rewritten).toContain('url("/assets/');
    expect(rewritten).not.toContain(remote);
  });

  it("keeps failed downloads remote", async () => {
    const remote =
      "https://cdn.example.com/missing.jpg";

    const bundle =
      await bundleStaticExportMedia(
        {
          "index.html":
            `<img src="${remote}" />`,
        },
        async () => null
      );

    const rewritten =
      rewriteMediaUrlsInHtml(
        `<img src="${remote}" />`,
        bundle.urlMap
      );

    expect(bundle.assets).toHaveLength(0);
    expect(bundle.failedUrls).toEqual([
      remote,
    ]);
    expect(rewritten).toContain(remote);
  });

  it("preserves data image URLs without downloading", async () => {
    const dataUrl =
      "data:image/png;base64,AAAA";

    let calls =
      0;

    const bundle =
      await bundleStaticExportMedia(
        {
          "index.html":
            `<img src="${dataUrl}" />`,
        },
        async () => {
          calls += 1;

          return {
            contentType:
              "image/png",
            buffer:
              Buffer.from("png"),
          };
        }
      );

    expect(calls).toBe(0);
    expect(bundle.assets).toHaveLength(0);
    expect(
      collectMediaUrlsFromHtml(
        `<img src="${dataUrl}" />`
      )
    ).toContain(dataUrl);
  });

  it("rejects unsafe private URLs", async () => {
    await expect(
      isSafePublicMediaUrl(
        "http://127.0.0.1/image.png"
      )
    ).resolves.toBe(false);

    await expect(
      isSafePublicMediaUrl(
        "http://localhost/image.png"
      )
    ).resolves.toBe(false);
  });
});
