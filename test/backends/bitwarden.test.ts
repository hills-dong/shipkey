import { describe, test, expect } from "bun:test";
import { BitwardenBackend } from "../../src/backends/bitwarden";

describe("BitwardenBackend", () => {
  test("name is 'Bitwarden'", () => {
    const backend = new BitwardenBackend();
    expect(backend.name).toBe("Bitwarden");
  });

  test("builds correct field name for storage", () => {
    const backend = new BitwardenBackend();
    const ref = {
      vault: "shipkey",
      provider: "OpenRouter",
      project: "shipcast",
      env: "dev",
      field: "OPENROUTER_API_KEY",
    };
    expect(backend.buildFieldName(ref)).toBe("shipcast-dev.OPENROUTER_API_KEY");
  });

  test("parses field name back to components", () => {
    const parsed = BitwardenBackend.parseFieldName("shipcast-dev.OPENROUTER_API_KEY");
    expect(parsed).toEqual({
      project: "shipcast",
      env: "dev",
      field: "OPENROUTER_API_KEY",
    });
  });

  test("parseFieldName returns null for invalid format", () => {
    expect(BitwardenBackend.parseFieldName("invalid")).toBeNull();
    expect(BitwardenBackend.parseFieldName("noDash.FIELD")).toBeNull();
  });

  test("buildInlineRef returns null (Bitwarden has no inline refs)", () => {
    const backend = new BitwardenBackend();
    const ref = {
      vault: "shipkey",
      provider: "OpenRouter",
      project: "shipcast",
      env: "dev",
      field: "OPENROUTER_API_KEY",
    };
    expect(backend.buildInlineRef(ref)).toBeNull();
  });
});
