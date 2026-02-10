import { describe, test, expect } from "bun:test";
import { MockBackend } from "../helpers/mock-backend";

describe("push command logic", () => {
  test("MockBackend.write stores values correctly", async () => {
    const backend = new MockBackend();
    await backend.write({
      ref: {
        vault: "shipkey",
        provider: "OpenAI",
        project: "myapp",
        env: "dev",
        field: "OPENAI_API_KEY",
      },
      value: "sk-test-123",
    });

    expect(backend.calls).toHaveLength(1);
    expect(backend.calls[0].method).toBe("write");

    const value = await backend.read({
      vault: "shipkey",
      provider: "OpenAI",
      project: "myapp",
      env: "dev",
      field: "OPENAI_API_KEY",
    });
    expect(value).toBe("sk-test-123");
  });

  test("MockBackend.write overwrites existing values", async () => {
    const backend = new MockBackend();
    const ref = {
      vault: "shipkey",
      provider: "Stripe",
      project: "myapp",
      env: "prod",
      field: "STRIPE_KEY",
    };

    await backend.write({ ref, value: "old-value" });
    await backend.write({ ref, value: "new-value" });

    const value = await backend.read(ref);
    expect(value).toBe("new-value");
  });

  test("MockBackend handles empty scan gracefully", async () => {
    const backend = new MockBackend();
    const refs = await backend.list("nonexistent", "dev");
    expect(refs).toHaveLength(0);
  });

  test("MockBackend.write uses correct vault from ref", async () => {
    const backend = new MockBackend();
    await backend.write({
      ref: {
        vault: "custom-vault",
        provider: "AWS",
        project: "myapp",
        env: "prod",
        field: "AWS_ACCESS_KEY_ID",
      },
      value: "AKIAIOSFODNN7EXAMPLE",
    });

    expect(backend.calls[0].args[0].ref.vault).toBe("custom-vault");
  });
});
