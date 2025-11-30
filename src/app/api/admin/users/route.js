import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ users: users || [] })

    } catch (error) {
        console.error('Fetch Admin Users Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch admin users' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const { email, full_name, role } = await request.json()

        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email and role are required' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Check if user already exists
        const { data: existing } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', email)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Create auth user first (they'll need to set password via email)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name }
        })

        if (authError) throw authError

        // Create admin user record
        const { data: adminUser, error: dbError } = await supabase
            .from('admin_users')
            .insert([{
                user_id: authUser.user.id,
                email,
                full_name,
                role,
                is_active: true
            }])
            .select()
            .single()

        if (dbError) {
            // Rollback auth user creation if admin user creation fails
            await supabase.auth.admin.deleteUser(authUser.user.id)
            throw dbError
        }

        // Send password setup email
        await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
        })

        return NextResponse.json({
            message: 'Admin user created successfully. Invitation email sent.',
            user: adminUser
        })

    } catch (error) {
        console.error('Create Admin User Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create admin user' },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        const { id, full_name, role, is_active } = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const updates = {}
        if (full_name !== undefined) updates.full_name = full_name
        if (role !== undefined) updates.role = role
        if (is_active !== undefined) updates.is_active = is_active

        const { data, error } = await supabase
            .from('admin_users')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            message: 'Admin user updated successfully',
            user: data
        })

    } catch (error) {
        console.error('Update Admin User Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update admin user' },
            { status: 500 }
        )
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Get user_id before deletion
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!adminUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Delete from auth.users (will cascade to admin_users)
        const { error: authError } = await supabase.auth.admin.deleteUser(adminUser.user_id)
        if (authError) throw authError

        return NextResponse.json({ message: 'Admin user deleted successfully' })

    } catch (error) {
        console.error('Delete Admin User Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete admin user' },
            { status: 500 }
        )
    }
}
