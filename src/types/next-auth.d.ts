import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
      currentNumber: number;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
    currentNumber?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    currentNumber?: number;
  }
}
