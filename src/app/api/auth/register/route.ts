import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, RegisterSchema } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 2. Check existence
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await hashPassword(password);

    // 4. Create User
    await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        passwordHistory: {
          create: {
            passwordHash: hashedPassword,
          }
        }
      },
    });

    // 5. Audit Log (Security Feature)
    // Ideally user ID would be retrieved from the newly created user
    const newUser = await db.user.findUnique({ where: { email } });
    if (newUser) {
      await db.auditLog.create({
        data: {
          action: "REGISTER",
          userId: newUser.id,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          metadata: JSON.stringify({ email }),
        },
      });
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
