import { describe, test, expect } from "bun:test";
import { MockBackend } from "../helpers/mock-backend";

describe("list command logic", () => {
  test("backend.list filters by project and env", async () => {
    const backend = new MockBackend();
    backend.seed("OpenAI", "myapp", "dev", "OPENAI_API_KEY", "sk-123");
    backend.seed("OpenAI", "myapp", "prod", "OPENAI_API_KEY", "sk-456");
    backend.seed("Stripe", "other", "dev", "STRIPE_KEY", "sk_test");

    const devRefs = await backend.list("myapp", "dev");
    expect(devRefs).toHaveLength(1);
    expect(devRefs[0].field).toBe("OPENAI_API_KEY");
    expect(devRefs[0].env).toBe("dev");
  });

  test("backend.list with undefined project returns all", async () => {
    const backend = new MockBackend();
    backend.seed("OpenAI", "myapp", "dev", "OPENAI_API_KEY", "sk-123");
    backend.seed("Stripe", "other", "dev", "STRIPE_KEY", "sk_test");

    const allRefs = await backend.list(undefined, "dev");
    expect(allRefs).toHaveLength(2);
  });

  test("list groups refs by provider", async () => {
    const backend = new MockBackend();
    backend.seed("OpenAI", "myapp", "dev", "OPENAI_API_KEY", "sk-123");
    backend.seed("OpenAI", "myapp", "dev", "OPENAI_ORG_ID", "org-456");
    backend.seed("Stripe", "myapp", "dev", "STRIPE_KEY", "sk_test");

    const refs = await backend.list("myapp", "dev");
    const grouped = new Map<string, typeof refs>();
    for (const ref of refs) {
      const key = `${ref.provider} (${ref.project}.${ref.env})`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(ref);
    }

    expect(grouped.get("OpenAI (myapp.dev)")).toHaveLength(2);
    expect(grouped.get("Stripe (myapp.dev)")).toHaveLength(1);
  });

  test("list handles empty result", async () => {
    const backend = new MockBackend();
    const refs = await backend.list("nonexistent");
    expect(refs).toHaveLength(0);
  });
});
