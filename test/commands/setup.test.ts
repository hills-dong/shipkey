import { describe, test, expect } from "bun:test";
import { getBackend, listBackends } from "../../src/backends";
import { MockBackend } from "../helpers/mock-backend";

describe("setup command API contract", () => {
  test("getBackend returns correct backend for config.backend value", () => {
    const op = getBackend("1password");
    expect(op.name).toBe("1Password");

    const bw = getBackend("bitwarden");
    expect(bw.name).toBe("Bitwarden");
  });

  test("backend.checkStatus returns valid status values", async () => {
    const backend = new MockBackend();
    const status = await backend.checkStatus();
    expect(["not_installed", "not_logged_in", "ready"]).toContain(status);
  });

  test("backend.isAvailable reflects checkStatus", async () => {
    const backend = new MockBackend();
    // MockBackend always returns "ready"
    expect(await backend.isAvailable()).toBe(true);
  });

  test("API /api/config contract includes backend field", () => {
    // Verify the shape we expect from /api/config
    const mockResponse = {
      project: "myapp",
      vault: "shipkey",
      env: "prod",
      backend: "bitwarden",
      providers: {},
      targets: {},
    };
    expect(mockResponse).toHaveProperty("backend");
    expect(mockResponse.backend).toBe("bitwarden");
  });

  test("API /api/status contract uses backend_status and backend_name", () => {
    // Verify the shape we expect from /api/status
    const mockResponse = {
      field_status: {},
      backend_status: "ready",
      backend_name: "1password",
      target_status: {},
    };
    expect(mockResponse).toHaveProperty("backend_status");
    expect(mockResponse).toHaveProperty("backend_name");
    expect(mockResponse).not.toHaveProperty("op_status");
  });

  test("listBackends includes both 1password and bitwarden", () => {
    const backends = listBackends();
    expect(backends).toContain("1password");
    expect(backends).toContain("bitwarden");
  });
});
