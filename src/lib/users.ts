import bcrypt from "bcryptjs";
import { readDemo, writeDemo } from "./demo-db";
import { hasDatabase, getPrisma } from "./repo";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
}

export async function findOrCreateUserByPhone(phone: string): Promise<SessionUser> {
  const prisma = await getPrisma();
  if (prisma && hasDatabase()) {
    try {
      const user = await prisma.user.upsert({
        where: { phone },
        update: {},
        create: { phone, name: `Guest ${phone.slice(-4)}` },
      });
      return {
        id: user.id,
        name: user.name ?? `Guest ${phone.slice(-4)}`,
        email: user.email ?? "",
        phone: user.phone ?? phone,
        role: user.role,
      };
    } catch {
      /* fall back */
    }
  }
  const demo = readDemo();
  let user = demo.users.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: `phone-${phone}`,
      name: `Guest ${phone.slice(-4)}`,
      email: `${phone}@phone.jmdgems.in`,
      phone,
      role: "USER",
      createdAt: new Date().toISOString(),
    };
    demo.users.push(user);
    writeDemo(demo);
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? phone,
    role: user.role,
  };
}

export async function findUserByEmail(email: string): Promise<(SessionUser & { passwordHash: string | null }) | null> {
  const prisma = await getPrisma();
  if (prisma && hasDatabase()) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return {
          id: user.id,
          name: user.name ?? "JMD Admin",
          email: user.email ?? email,
          phone: user.phone ?? "",
          role: user.role,
          passwordHash: user.passwordHash,
        };
      }
    } catch {
      /* fall back */
    }
  }
  const demo = readDemo().users.find((u) => u.email === email);
  if (!demo) return null;
  return {
    id: demo.id,
    name: demo.name,
    email: demo.email,
    phone: demo.phone ?? "",
    role: demo.role,
    passwordHash: demo.passwordHash ?? null,
  };
}

export async function verifyAdminPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash) {
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }
  // Demo/admin fallback when running without Postgres and without a stored hash.
  const expected = process.env.SEED_ADMIN_PASSWORD || "JmdAdmin@2026";
  if (password === expected && user.role === "ADMIN") return user;
  return null;
}

export async function upsertGoogleUser(email: string, name: string, image?: string): Promise<SessionUser> {
  const prisma = await getPrisma();
  if (prisma && hasDatabase()) {
    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: { name, image },
        create: { email, name, image },
      });
      return { id: user.id, name: user.name ?? name, email: user.email ?? email, phone: user.phone ?? "", role: user.role };
    } catch {
      /* fall back */
    }
  }
  const demo = readDemo();
  let user = demo.users.find((u) => u.email === email);
  if (!user) {
    user = { id: `google-${Date.now()}`, name, email, role: "USER", createdAt: new Date().toISOString() };
    demo.users.push(user);
    writeDemo(demo);
  }
  return { id: user.id, name: user.name, email: user.email, phone: user.phone ?? "", role: user.role };
}
