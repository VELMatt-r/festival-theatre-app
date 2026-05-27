import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId, disabled } = await request.json();

  if (!userId || typeof disabled !== "boolean") {
    return NextResponse.json(
      { error: "Missing userId or disabled value." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: authError } =
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: disabled ? "876000h" : "0h",
    });

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ disabled })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}