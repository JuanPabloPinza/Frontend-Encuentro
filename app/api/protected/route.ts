import { NextRequest, NextResponse } from 'next/server'
import { serverAuthUtils } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await serverAuthUtils.requireAuth(request)
    
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated, return protected data
    return NextResponse.json({
      message: 'This is protected data',
      user: auth.user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in protected route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await serverAuthUtils.requireAuth(request)
    
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Process the request with authenticated user context
    return NextResponse.json({
      message: 'Data processed successfully',
      user: auth.user,
      data: body
    })
  } catch (error) {
    console.error('Error in protected route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
