import { describe, test, expect } from "bun:test";
import { parseDotenv } from "../../../src/scanner/parsers/dotenv";

describe("parseDotenv", () => {
  test("parses KEY=VALUE lines", () => {
    const content = `
DATABASE_URL=postgres://localhost:5432/db
API_KEY=sk-test-123
`;
    const result = parseDotenv(content);
    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgres://localhost:5432/db" },
      { key: "API_KEY", value: "sk-test-123" },
    ]);
  });

  test("parses template placeholders", () => {
    const content = `
DATABASE_URL=
API_KEY=your-api-key-here
SECRET=
`;
    const result = parseDotenv(content);
    expect(result).toEqual([
      { key: "DATABASE_URL", value: "" },
      { key: "API_KEY", value: "your-api-key-here" },
      { key: "SECRET", value: "" },
    ]);
  });

  test("skips comments and blank lines", () => {
    const content = `
# This is a comment
DATABASE_URL=test

# Another comment
API_KEY=key
`;
    const result = parseDotenv(content);
    expect(result).toHaveLength(2);
  });

  test("handles quoted values", () => {
    const content = `SECRET="hello world"
KEY='single quoted'`;
    const result = parseDotenv(content);
    expect(result).toEqual([
      { key: "SECRET", value: "hello world" },
      { key: "KEY", value: "single quoted" },
    ]);
  });
});
