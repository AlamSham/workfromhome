import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(
      data || {
        success: response.ok,
        message: response.ok ? "Search alert saved successfully." : "Unable to save search alert.",
      },
      { status: response.status }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to save search alert."
      },
      { status: 500 }
    );
  }
}
