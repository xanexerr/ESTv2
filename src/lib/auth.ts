import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionUser {
  userId: string;
  username: string;
  role: "admin" | "teacher" | "student";
  userFname: string;
  userLname: string;
}

const COOKIE_NAME = "estv2_session";

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "htc-estv2-super-secret-jwt-key-2026";
  return new TextEncoder().encode(secret);
}

export async function createSessionCookie(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: String(payload.userId),
      username: String(payload.username),
      role: payload.role as "admin" | "teacher" | "student",
      userFname: String(payload.userFname || ""),
      userLname: String(payload.userLname || ""),
    };
  } catch {
    return null;
  }
}
