import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { UserRole } from './roles'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      membershipType?: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    membershipType?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/error',
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: (user.role as UserRole) || UserRole.MEMBER,
          membershipType: user.membershipType,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role || UserRole.MEMBER
        token.membershipType = user.membershipType
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as UserRole) || UserRole.MEMBER
        session.user.membershipType = token.membershipType as string | null
      }

      return session
    },

    async signIn({ user, account, profile }) {
      // For OAuth providers, set default role if not exists
      if (account?.provider === 'google') {
        if (user.email) {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1)

          // If user doesn't have a role, set default to member
          if (existingUser && !existingUser.role) {
            await db
              .update(users)
              .set({ role: UserRole.MEMBER })
              .where(eq(users.id, existingUser.id))
          }
        }
      }

      return true
    },
  },

  events: {
    async createUser({ user }) {
      // Set default role for new users
      if (user.id && !user.role) {
        await db
          .update(users)
          .set({ role: UserRole.MEMBER })
          .where(eq(users.id, user.id))
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
})
