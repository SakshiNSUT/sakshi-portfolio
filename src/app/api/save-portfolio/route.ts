import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Prevent filesystem writes in production deployment (Vercel has read-only FS)
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        success: true,
        message: "Changes saved to browser session (filesystem write skipped in production)",
        mode: "production"
      });
    }

    // Write to the local project folder
    const filePath = path.join(process.cwd(), "src", "data", "portfolio.json");
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Changes successfully written to src/data/portfolio.json",
      mode: "development"
    });
  } catch (error: any) {
    console.error("Error saving portfolio data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
