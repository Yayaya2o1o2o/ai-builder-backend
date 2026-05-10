import { describe, it, expect } from "vitest";
import { convertAll, generateNames, VALID_STYLES } from "./logic";

describe("naming logic", () => {
  describe("convertAll", () => {
    it("converts camelCase input", () => {
      const res = convertAll("myVariableName");
      expect(res.tokens).toEqual(["my", "variable", "name"]);
      expect(res.camelCase).toBe("myVariableName");
      expect(res.PascalCase).toBe("MyVariableName");
      expect(res.snake_case).toBe("my_variable_name");
      expect(res.SCREAMING_SNAKE_CASE).toBe("MY_VARIABLE_NAME");
      expect(res["kebab-case"]).toBe("my-variable-name");
      expect(res["Train-Case"]).toBe("My-Variable-Name");
      expect(res["dot.case"]).toBe("my.variable.name");
      expect(res.flatcase).toBe("myvariablename");
    });

    it("converts snake_case input", () => {
      const res = convertAll("my_variable_name");
      expect(res.tokens).toEqual(["my", "variable", "name"]);
      expect(res.PascalCase).toBe("MyVariableName");
    });

    it("converts kebab-case input", () => {
      const res = convertAll("my-variable-name");
      expect(res.tokens).toEqual(["my", "variable", "name"]);
      expect(res.camelCase).toBe("myVariableName");
    });

    it("converts PascalCase input", () => {
      const res = convertAll("MyVariableName");
      expect(res.tokens).toEqual(["my", "variable", "name"]);
      expect(res.snake_case).toBe("my_variable_name");
    });

    it("converts space-separated words", () => {
      const res = convertAll("my variable name");
      expect(res.tokens).toEqual(["my", "variable", "name"]);
    });

    it("converts SCREAMING_SNAKE_CASE input", () => {
      const res = convertAll("MY_CONSTANT_VALUE");
      expect(res.tokens).toEqual(["my", "constant", "value"]);
      expect(res.camelCase).toBe("myConstantValue");
    });

    it("handles a single word", () => {
      const res = convertAll("user");
      expect(res.tokens).toEqual(["user"]);
      expect(res.camelCase).toBe("user");
      expect(res.PascalCase).toBe("User");
    });
  });

  describe("generateNames", () => {
    it("returns suggestions for startup style", () => {
      const names = generateNames("startup", 5);
      expect(names).toHaveLength(5);
    });

    it("respects the count parameter", () => {
      const names = generateNames("startup", 3);
      expect(names).toHaveLength(3);
    });

    it("clamps count to maximum of 10", () => {
      const names = generateNames("dev-tool", 999);
      expect(names.length).toBeLessThanOrEqual(10);
    });

    it("falls back to startup for unknown style", () => {
      const names = generateNames("unknown-vibe-mode", 3);
      expect(names).toHaveLength(3);
    });

    it("returns unique suggestions", () => {
      const names = generateNames("saas", 8);
      const unique = new Set(names);
      expect(unique.size).toBe(names.length);
    });

    it("covers all supported styles", () => {
      for (const style of VALID_STYLES) {
        const names = generateNames(style, 2);
        expect(names).toHaveLength(2);
      }
    });

    it("exposes all valid styles", () => {
      expect(VALID_STYLES).toContain("startup");
      expect(VALID_STYLES).toContain("dev-tool");
      expect(VALID_STYLES).toContain("cli");
      expect(VALID_STYLES).toContain("saas");
    });
  });
});
