"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/utils/supabase/server";

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!phone || !password) {
    return { error: "Phone number and password are required." };
  }

  // Clean phone number (remove spaces, dashes, +91 prefix)
  const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^91/, "");

  if (!/^\d{10}$/.test(cleanPhone)) {
    return { error: "Please enter a valid 10-digit phone number." };
  }

  try {
    // Use admin client to bypass RLS for user lookup
    const supabase = await createAdminClient();

    // Fetch user by phone
    const { data: user, error } = await supabase
      .from("users")
      .select("id, phone, password_hash, name, role, is_active, is_approved")
      .eq("phone", cleanPhone)
      .single();

    if (error || !user) {
      return { error: "Invalid phone number or password." };
    }

    if (!user.is_active) {
      return { error: "Your account has been deactivated. Contact admin." };
    }

    if (!user.is_approved) {
      return { error: "Your account is pending CEO approval." };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return { error: "Invalid phone number or password." };
    }

    // Update last_login timestamp
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Set custom session cookie
    const session = {
      userId: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      loginAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set("si_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Redirect based on role
    redirect(`/dashboard/${user.role}`);
  } catch (err: unknown) {
    // redirect() throws a NEXT_REDIRECT error — let it propagate
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    // Check for Next.js redirect digest
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("si_session");
  redirect("/login");
}
