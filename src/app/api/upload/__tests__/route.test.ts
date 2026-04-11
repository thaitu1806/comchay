import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUpload = vi.fn();

vi.mock("@/lib/cloudinary", () => ({
  default: {
    uploader: {
      upload: (...args: unknown[]) => mockUpload(...args),
    },
  },
}));

import { POST } from "../route";

function createRequest(formDataFn: () => Promise<FormData>): NextRequest {
  const req = new NextRequest("http://localhost/api/upload", {
    method: "POST",
  });
  req.formData = formDataFn;
  return req;
}

function createFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size);
  const file = new File([content], name, { type });
  // jsdom File doesn't implement arrayBuffer properly, so we polyfill it
  if (!file.arrayBuffer || typeof file.arrayBuffer !== "function") {
    file.arrayBuffer = () => Promise.resolve(content.buffer);
  }
  return file;
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no file is provided", async () => {
    const req = createRequest(async () => new FormData());

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("File is required");
  });

  it("returns 400 for unsupported file types", async () => {
    const file = createFile("doc.pdf", 1024, "application/pdf");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("File must be an image or video");
  });

  it("returns 400 when image exceeds 10MB limit", async () => {
    const size = 11 * 1024 * 1024; // 11MB
    const file = createFile("large.jpg", size, "image/jpeg");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("10");
  });

  it("returns 400 when video exceeds 50MB limit", async () => {
    const size = 51 * 1024 * 1024; // 51MB
    const file = createFile("large.mp4", size, "video/mp4");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("50");
  });

  it("returns 201 with URL and type for successful image upload", async () => {
    mockUpload.mockResolvedValueOnce({
      secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    });

    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.url).toBe(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );
    expect(json.type).toBe("image");
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringContaining("data:image/jpeg;base64,"),
      { resource_type: "image" }
    );
  });

  it("returns 201 with URL and type for successful video upload", async () => {
    mockUpload.mockResolvedValueOnce({
      secure_url: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
    });

    const file = createFile("clip.mp4", 2048, "video/mp4");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.url).toBe(
      "https://res.cloudinary.com/demo/video/upload/sample.mp4"
    );
    expect(json.type).toBe("video");
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringContaining("data:video/mp4;base64,"),
      { resource_type: "video" }
    );
  });

  it("returns 500 when Cloudinary upload fails", async () => {
    mockUpload.mockRejectedValueOnce(new Error("Cloudinary error"));

    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const req = createRequest(async () => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
