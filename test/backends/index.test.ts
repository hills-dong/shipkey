import { describe, test, expect } from "bun:test";
import { getBackend, listBackends } from "../../src/backends";
import { OnePasswordBackend } from "../../src/backends/onepassword";
import { BitwardenBackend } from "../../src/backends/bitwarden";

describe("getBackend", () => {
  test("returns OnePasswordBackend for '1password'", () => {
    const backend = getBackend("1password");
    expect(backend).toBeInstanceOf(OnePasswordBackend);
    expect(backend.name).toBe("1Password");
  });

  test("returns BitwardenBackend for 'bitwarden'", () => {
    const backend = getBackend("bitwarden");
    expect(backend).toBeInstanceOf(BitwardenBackend);
    expect(backend.name).toBe("Bitwarden");
  });

  test("defaults to 1Password when no argument", () => {
    const backend = getBackend();
    expect(backend).toBeInstanceOf(OnePasswordBackend);
  });

  test("throws for unknown backend", () => {
    expect(() => getBackend("unknown")).toThrow("Unknown backend: unknown");
  });
});

describe("listBackends", () => {
  test("returns all registered backends", () => {
    const backends = listBackends();
    expect(backends).toContain("1password");
    expect(backends).toContain("bitwarden");
    expect(backends).toHaveLength(2);
  });
});
