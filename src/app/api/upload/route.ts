import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    let type: "image" | "video";

    if (mimeType.startsWith("image/")) {
      type = "image";
    } else if (mimeType.startsWith("video/")) {
      type = "video";
    } else {
      return NextResponse.json(
        { error: "File must be an image or video" },
        { status: 400 }
      );
    }

    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File vượt quá dung lượng cho phép (tối đa ${maxMB} MB)` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: type === "video" ? "video" : "image",
    });

    return NextResponse.json(
      { url: result.secure_url, type },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Tải file thất bại, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
