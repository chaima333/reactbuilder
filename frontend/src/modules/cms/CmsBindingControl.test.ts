import {
  describe,
  expect,
  it
} from "vitest";

import {
  extractCmsBindingKey,
  formatCmsBindingValue
} from "./CmsBindingControl";

describe("CmsBindingControl helpers", () => {
  it("emits strict CMS binding syntax", () => {
    expect(
      formatCmsBindingValue("title")
    ).toBe("{{cms.title}}");
  });

  it("recognizes strict CMS bindings", () => {
    expect(
      extractCmsBindingKey(
        "{{cms.title}}"
      )
    ).toBe("title");
  });

  it("recognizes legacy exact tokens for display", () => {
    expect(
      extractCmsBindingKey("{{title}}")
    ).toBe("title");
  });

  it("rewrites legacy values through strict formatter", () => {
    const displayed =
      extractCmsBindingKey("{{title}}");

    expect(
      formatCmsBindingValue(displayed)
    ).toBe("{{cms.title}}");
  });

  it("does not recognize nested CMS paths", () => {
    expect(
      extractCmsBindingKey(
        "{{cms.author.name}}"
      )
    ).toBe("");
  });
});
