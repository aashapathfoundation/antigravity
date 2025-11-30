"use client"

import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, Trash2, Edit2, Check, X, Loader2, Mail, Calendar } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('users')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddUser, setShowAddUser] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({ email: '', full_name: '', role: 'editor' })
    const [processing, setProcessing] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setUsers(data.users || [])
        } catch (error) {
            console.error('Fetch Error:', error)
            showMessage('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e) => {
        e.preventDefault()
        setProcessing(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            showMessage('success', data.message)
            setFormData({ email: '', full_name: '', role: 'editor' })
            setShowAddUser(false)
            await fetchUsers()
        } catch (error) {
            showMessage('error', error.message)
        } finally {
            setProcessing(false)
        }
    }

    const handleUpdateUser = async (userId, updates) => {
        setProcessing(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, ...updates })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            showMessage('success', data.message)
            setEditingUser(null)
            await fetchUsers()
        } catch (error) {
            showMessage('error', error.message)
        } finally {
            setProcessing(false)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        setProcessing(true)
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            showMessage('success', data.message)
            await fetchUsers()
        } catch (error) {
            showMessage('error', error.message)
        } finally {
            setProcessing(false)
        }
    }

    const showMessage = (type, text) => {
        setMessage({ type, text })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }

    const getRoleBadge = (role) => {
        const styles = {
            super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
            admin: 'bg-blue-100 text-blue-800 border-blue-200',
            editor: 'bg-green-100 text-green-800 border-green-200'
        }
        const labels = {
            super_admin: 'Super Admin',
            admin: 'Admin',
            editor: 'Editor'
        }
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[role]}`}>
                <Shield className="w-3 h-3" />
                {labels[role]}
            </span>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage admin users and permissions</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Users className="w-4 h-4 inline mr-2" />
                                Admin Users
                            </button>
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roles'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Shield className="w-4 h-4 inline mr-2" />
                                Roles & Permissions
                            </button>
                        </nav>
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Admin Users</h2>
                                    <p className="text-sm text-gray-600 mt-1">Manage administrator access and permissions</p>
                                </div>
                                <button
                                    onClick={() => setShowAddUser(true)}
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add User
                                </button>
                            </div>

                            {/* Add User Form */}
                            {showAddUser && (
                                <form onSubmit={handleAddUser} className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Add New Admin User</h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddUser(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                            <select
                                                required
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        {processing ? 'Adding...' : 'Add User'}
                                    </button>
                                </form>
                            )}

                            {/* Users List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : users.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingUser === user.id ? (
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                                                                className="px-3 py-1 text-xs border border-gray-300 rounded"
                                                            >
                                                                <option value="editor">Editor</option>
                                                                <option value="admin">Admin</option>
                                                                <option value="super_admin">Super Admin</option>
                                                            </select>
                                                        ) : (
                                                            getRoleBadge(user.role)
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {formatDate(user.last_login)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(user.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete"
                                                                disabled={user.role === 'super_admin'}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No admin users found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Roles & Permissions</h2>

                            <div className="space-y-4">
                                <RoleCard
                                    role="Super Admin"
                                    color="purple"
                                    permissions={[
                                        'Full system access',
                                        'Manage all admin users',
                                        'Create, edit, delete campaigns',
                                        'View and export all donations',
                                        'Send email campaigns',
                                        'Access all settings',
                                        'View activity logs'
                                    ]}
                                />
                                <RoleCard
                                    role="Admin"
                                    color="blue"
                                    permissions={[
                                        'Create, edit campaigns',
                                        'View all donations',
                                        'Send email campaigns',
                                        'Manage newsletter subscribers',
                                        'View basic analytics'
                                    ]}
                                />
                                <RoleCard
                                    role="Editor"
                                    color="green"
                                    permissions={[
                                        'Create and edit campaigns',
                                        'View donations',
                                        'Manage success stories',
                                        'View basic statistics'
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function RoleCard({ role, color, permissions }) {
    const colors = {
        purple: 'border-purple-200 bg-purple-50',
        blue: 'border-blue-200 bg-blue-50',
        green: 'border-green-200 bg-green-50'
    }

    const badgeColors = {
        purple: 'bg-purple-100 text-purple-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800'
    }

    return (
        <div className={`p-6 border rounded-lg ${colors[color]}`}>
            <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6" />
                <h3 className="text-lg font-bold text-gray-900">{role}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColors[color]}`}>
                    {permissions.length} Permissions
                </span>
            </div>
            <ul className="space-y-2">
                {permissions.map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {permission}
                    </li>
                ))}
            </ul>
        </div>
    )
}
