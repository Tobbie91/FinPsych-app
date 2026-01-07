import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, roles } = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check for service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: missing service role key' },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Invite user - sends email automatically
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { role: 'admin', name },
      }
    );

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user invitation' },
        { status: 500 }
      );
    }

    // Insert into admin_users table
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        name,
        email,
        roles: roles || [],
        status: 'active',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Still return success since the auth user was created
      // The user can be added to admin_users later
      return NextResponse.json({
        success: true,
        warning: 'User invited but failed to add to admin_users table: ' + dbError.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
