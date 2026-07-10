import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Get the authenticated Clerk user and ensure they exist in our database
 * This is the SINGLE SOURCE OF TRUTH for user authentication
 */
export async function getAuthenticatedUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Ensure user exists in our database (in case webhook missed it)
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: clerkUser.id },
      include: {
        profile: true,
      },
    })

    // If user doesn't exist in DB, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          imageUrl: clerkUser.imageUrl || null,
          username: clerkUser.username || null,
        },
        include: {
          profile: true,
        },
      })
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      imageUrl: dbUser.imageUrl,
      username: dbUser.username,
      profile: dbUser.profile,
      createdAt: dbUser.createdAt,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error getting/creating user in database:', error)
    throw new Error(`Failed to authenticate user: ${message}`)
  }
}

/**
 * Get just the Clerk user ID (faster, no DB query)
 */
export async function getAuthenticatedUserId() {
  const clerkUser = await currentUser()
  return clerkUser?.id || null
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    throw new Error('Unauthorized - please sign in')
  }
  
  return user
}
