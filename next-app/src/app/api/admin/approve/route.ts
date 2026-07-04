import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Bypass RLS for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      const { error } = await supabase
        .from("users")
        .update({ status: "REJECTED", is_approved: false })
        .eq("id", userId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "User rejected successfully.",
      });
    }

    if (action === "APPROVE") {
      // 1. Update users table status
      const { data: user, error: userError } = await supabase
        .from("users")
        .update({ status: "APPROVED", is_approved: true })
        .eq("id", userId)
        .select()
        .single();

      if (userError) throw userError;

      // 2. Insert into main DB based on role
      if (role === "painter") {
        const { error: painterError } = await supabase.from("painters").insert({
          id: user.id,
          name: user.name || "Unknown Painter",
          phone: user.phone,
        }).select();
        // Ignore if already exists (might cause 23505 duplicate key error)
        if (painterError && painterError.code !== '23505') {
            console.error("Painter insert error:", painterError);
        }
      } else if (role === "salesman") {
        const { error: salesmanError } = await supabase.from("salesmen").insert({
          id: user.id,
          name: user.name || "Unknown Salesman",
          phone: user.phone,
          region: user.territory || "Unassigned"
        }).select();
        if (salesmanError && salesmanError.code !== '23505') {
            console.error("Salesman insert error:", salesmanError);
        }
      }
      
      // 3. Trigger mock email notification
      console.log(`[EMAIL TRIGGER] Sending approval email to ${user.name} (${user.phone}) - Role: ${role}`);

      return NextResponse.json({
        success: true,
        message: "User approved and synced to main database.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
