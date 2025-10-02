import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      teacherCode: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    teacherCode: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    teacherCode: string | null;
  }
}
