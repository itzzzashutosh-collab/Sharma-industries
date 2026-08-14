import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const { data: painters, error } = await supabase
      .from("painters")
      .select("id, name, total_tokens, phone")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: painters
    });
  } catch (err: any) {
    console.error("Fetch painters error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
