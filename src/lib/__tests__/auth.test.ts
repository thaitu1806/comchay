import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth";

describe("NextAuth configuration — Facebook OAuth", () => {
  it("Facebook provider is configured", () => {
    const providers = authOptions.providers;
    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe("facebook");
    expect(providers[0].name).toBe("Facebook");
  });

  describe("jwt callback", () => {
    it("stores name and facebookLink from profile", async () => {
      const jwtCallback = authOptions.callbacks!.jwt!;
      const profile = { id: "123456789", name: "Nguyễn Văn A" };
      const token = { sub: "token-sub" };

      const result = await (jwtCallback as Function)({
        token,
        profile,
        user: {},
        account: null,
        trigger: "signIn",
      });

      expect(result.name).toBe("Nguyễn Văn A");
      expect(result.facebookLink).toBe("https://facebook.com/123456789");
    });

    it("returns token unchanged when no profile", async () => {
      const jwtCallback = authOptions.callbacks!.jwt!;
      const token = { sub: "token-sub", name: "Existing" };

      const result = await (jwtCallback as Function)({
        token,
        profile: undefined,
        user: {},
        account: null,
        trigger: "update",
      });

      expect(result.name).toBe("Existing");
      expect(result.facebookLink).toBeUndefined();
    });
  });

  describe("session callback", () => {
    it("passes facebookLink to the session", async () => {
      const sessionCallback = authOptions.callbacks!.session!;
      const session = { user: { name: "Test" }, expires: "2099-01-01" };
      const token = {
        sub: "token-sub",
        name: "Nguyễn Văn A",
        facebookLink: "https://facebook.com/123456789",
      };

      const result = await (sessionCallback as Function)({
        session,
        token,
        user: {},
        trigger: "update",
      });

      expect(result.user.name).toBe("Nguyễn Văn A");
      expect(result.facebookLink).toBe("https://facebook.com/123456789");
    });

    it("handles session without user gracefully", async () => {
      const sessionCallback = authOptions.callbacks!.session!;
      const session = { user: undefined, expires: "2099-01-01" };
      const token = {
        sub: "token-sub",
        facebookLink: "https://facebook.com/123",
      };

      const result = await (sessionCallback as Function)({
        session,
        token,
        user: {},
        trigger: "update",
      });

      // facebookLink should not be set when user is undefined
      expect(result.facebookLink).toBeUndefined();
    });
  });
});
