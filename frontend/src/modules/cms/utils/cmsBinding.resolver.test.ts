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

describe("frontend cms binding resolver", () => {
  it("resolves exact tokens", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.title}}",
        { title: "Web Design" },
        fields
      )
    ).toBe("Web Design");
  });

  it("resolves embedded tokens", () => {
    expect(
      resolveCmsBindingValue(
        "Service: {{cms.title}}",
        { title: "Design" },
        fields
      )
    ).toBe("Service: Design");
  });

  it("uses the field whitelist", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.secret}}",
        { secret: "nope" },
        fields
      )
    ).toBe("");
  });

  it("handles missing fields safely", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.title}}",
        {},
        fields
      )
    ).toBe("");
  });

  it("rejects dangerous keys", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.__proto__}}",
        { __proto__: "bad" } as any,
        [{ key: "__proto__" }]
      )
    ).toBe("");
  });

  it("preserves typed values for exact tokens", () => {
    expect(
      resolveCmsBindingValue(
        "{{cms.count}}",
        { count: 9 },
        fields
      )
    ).toBe(9);

    expect(
      resolveCmsBindingValue(
        "{{cms.published}}",
        { published: true },
        fields
      )
    ).toBe(true);
  });

  it("does not mutate blocks or entry data", () => {
    const blocks = [
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

    const originalBlocks =
      structuredClone(blocks);
    const originalData =
      structuredClone(entryData);

    const resolved =
      resolveCmsBindingsInTree(
        blocks,
        entryData,
        fields
      ) as any[];

    expect(resolved[0].data.props.content)
      .toBe("Resolved");
    expect(blocks).toEqual(originalBlocks);
    expect(entryData).toEqual(originalData);
  });

  it("respects recursion limits", () => {
    const resolved =
      resolveCmsBindingsInTree(
        {
          level1: {
            level2: "{{cms.title}}"
          }
        },
        { title: "Too deep" },
        fields,
        { maxDepth: 1 }
      ) as any;

    expect(resolved.level1.level2)
      .toBe("{{cms.title}}");
  });
});
