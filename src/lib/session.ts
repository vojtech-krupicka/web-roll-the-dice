import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type SessionData = {
  /** ids of password-protected games this browser has unlocked. */
  unlockedGameIds: number[];
};

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set — copy .env.example to .env and fill it in.");
}

const sessionOptions = {
  cookieName: "dice-session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.unlockedGameIds) session.unlockedGameIds = [];
  return session;
}

export async function isGameUnlocked(gameId: number): Promise<boolean> {
  const session = await getSession();
  return session.unlockedGameIds!.includes(gameId);
}

export async function unlockGame(gameId: number): Promise<void> {
  const session = await getSession();
  if (!session.unlockedGameIds!.includes(gameId)) {
    session.unlockedGameIds!.push(gameId);
  }
  await session.save();
}

export async function lockGame(gameId: number): Promise<void> {
  const session = await getSession();
  session.unlockedGameIds = session.unlockedGameIds!.filter((id) => id !== gameId);
  await session.save();
}
