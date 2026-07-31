import {
  describe,
  expect,
  it
} from "vitest";

import {
  resolveCmsBindingValue,
  resolveCmsBindingsInTree
} from "./cmsBinding.resolver";

const fields = [
  { key: "title" },
  { key: "description" },
  { key: "count" },
  { key: "published" }
];

describe("cms binding resolver", () => {
  it("resolves exact CMS tokens", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.title}}",
        { title: "Web Design" },
        fields
      )
    ).toBe("Web Design");
  });

  it("leaves static strings unchanged", () => {
    expect(
      resolveCmsBindingValue(
        "Static title",
        { title: "Dynamic" },
        fields
      )
    ).toBe("Static title");
  });

  it("supports embedded CMS tokens", () => {
    expect(
      resolveCmsBindingValue(
        "Service: {{cms.title}}",
        { title: "Brand" },
        fields
      )
    ).toBe("Service: Brand");
  });

  it("only resolves whitelisted collection fields", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.secret}}",
        { secret: "nope" },
        fields
      )
    ).toBe("");
  });

  it("returns fallback for missing fields", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.title}}",
        {},
        fields,
        { fallback: "[missing]" }
      )
    ).toBe("[missing]");
  });

  it("does not allow dangerous keys", () => {
    const entryData = {
      __proto__: "bad",
      prototype: "bad",
      constructor: "bad"
    } as any;

    expect(
      resolveCmsBindingValue(
        "{{cms.__proto__}}",
        entryData,
        [{ key: "__proto__" }]
      )
    ).toBe("");

    expect(
      resolveCmsBindingValue(
        "{{cms.prototype}}",
        entryData,
        [{ key: "prototype" }]
      )
    ).toBe("");

    expect(
      resolveCmsBindingValue(
        "{{cms.constructor}}",
        entryData,
        [{ key: "constructor" }]
      )
    ).toBe("");
  });

  it("does not mutate the source tree or entry data", () => {
    const tree = [
      {
        data: {
          props: {
            content: "{{cms.title}}"
          }
        }
      }
    ];

    const entryData = {
      title: "Resolved"
    };

    const originalTree =
      structuredClone(tree);

    const originalEntry =
      structuredClone(entryData);

    const resolved =
      resolveCmsBindingsInTree(
        tree,
        entryData,
        fields
      ) as any[];

    expect(resolved[0].data.props.content)
      .toBe("Resolved");
    expect(tree).toEqual(originalTree);
    expect(entryData).toEqual(originalEntry);
  });

  it("preserves typed values for exact-token bindings", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.count}}",
        { count: 42 },
        fields
      )
    ).toBe(42);

    expect(
      resolveCmsBindingValue(
        "{{cms.published}}",
        { published: true },
        fields
      )
    ).toBe(true);
  });

  it("respects recursion limits", () => {
    const source = {
      level1: {
        level2: "{{cms.title}}"
      }
    };

    const resolved =
      resolveCmsBindingsInTree(
        source,
        { title: "Too deep" },
        fields,
        { maxDepth: 1 }
      ) as any;

    expect(resolved.level1.level2)
      .toBe("{{cms.title}}");
  });
});
