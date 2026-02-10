import { describe, test, expect } from "bun:test";
import { MockBackend } from "../helpers/mock-backend";
import { OnePasswordBackend } from "../../src/backends/onepassword";
import { BitwardenBackend } from "../../src/backends/bitwarden";

describe("pull command logic", () => {
  test("backend.list and backend.read retrieves stored values", async () => {
    const backend = new MockBackend();
    backend.seed("OpenAI", "myapp", "dev", "OPENAI_API_KEY", "sk-123");
    backend.seed("Stripe", "myapp", "dev", "STRIPE_KEY", "sk_test_456");

    const refs = await backend.list("myapp", "dev");
    expect(refs).toHaveLength(2);

    for (const ref of refs) {
      const value = await backend.read(ref);
      expect(value).toBeTruthy();
    }
  });

  test("1Password backend buildInlineRef returns op:// URI for .envrc", () => {
    const backend = new OnePasswordBackend();
    const ref = {
      vault: "shipkey",
      provider: "OpenAI",
      project: "myapp",
      env: "prod",
      field: "OPENAI_API_KEY",
    };
    const inlineRef = backend.buildInlineRef(ref);
    expect(inlineRef).toBe("op://shipkey/OpenAI/myapp-prod/OPENAI_API_KEY");
  });

  test("Bitwarden backend buildInlineRef returns null (direct values)", () => {
    const backend = new BitwardenBackend();
    const ref = {
      vault: "shipkey",
      provider: "OpenAI",
      project: "myapp",
      env: "prod",
      field: "OPENAI_API_KEY",
    };
    expect(backend.buildInlineRef(ref)).toBeNull();
  });

  test("MockBackend list handles empty vault gracefully", async () => {
    const backend = new MockBackend();
    const refs = await backend.list("myapp", "dev");
    expect(refs).toHaveLength(0);
  });

  test("envrc line generation differs by backend type", () => {
    const ref = {
      vault: "shipkey",
      provider: "OpenAI",
      project: "myapp",
      env: "prod",
      field: "OPENAI_API_KEY",
    };

    const opBackend = new OnePasswordBackend();
    const opInlineRef = opBackend.buildInlineRef(ref);
    const opLine = `export OPENAI_API_KEY=$(op read "${opInlineRef}")`;
    expect(opLine).toContain("op read");
    expect(opLine).toContain("op://");

    const bwBackend = new BitwardenBackend();
    const bwInlineRef = bwBackend.buildInlineRef(ref);
    expect(bwInlineRef).toBeNull();
    // When null, pull.ts writes direct value: export KEY="value"
  });
});
