import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const {
    email,
    password,
    displayName,
    phoneNumber,
    role,
    department,
    jobRoles,
  } = body;

  if (!email || !password || !displayName || !role) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: createdUser, error: createUserError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message || "Failed to create user." },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert([
    {
      id: createdUser.user.id,
      display_name: displayName,
      phone_number: phoneNumber || null,
      role,
      department: department || null,
      job_roles: jobRoles || [],
      disabled: false,
    },
  ]);

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    userId: createdUser.user.id,
  });
}