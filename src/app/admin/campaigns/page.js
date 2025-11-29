"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Check, Power, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function CampaignsPage() {
    const supabase = createClient()
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        image_url: ''
    })

    useEffect(() => {
        fetchCampaigns()

        // Real-time subscription for campaign updates (e.g. raised_amount)
        const channel = supabase
            .channel('campaigns-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'campaigns'
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setCampaigns((prev) =>
                            prev.map((c) => (c.id === payload.new.id ? payload.new : c))
                        )
                    } else if (payload.eventType === 'INSERT') {
                        setCampaigns((prev) => [payload.new, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setCampaigns(data || [])
        } catch (error) {
            console.error('Error fetching campaigns:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            // Optimistic update
            setCampaigns(campaigns.map(c =>
                c.id === id ? { ...c, is_active: !currentStatus } : c
            ))
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error updating status: ' + error.message)
            fetchCampaigns() // Revert on error
        }
    }

    const handleImageUpload = async (e) => {
        try {
            setUploading(true)
            const file = e.target.files[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('campaigns')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('campaigns')
                .getPublicUrl(filePath)

            setFormData({ ...formData, image_url: data.publicUrl })
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingCampaign) {
                // Update existing campaign
                const { error } = await supabase
                    .from('campaigns')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        goal_amount: Number(formData.goal_amount),
                        image_url: formData.image_url
                    })
                    .eq('id', editingCampaign.id)

                if (error) throw error
            } else {
                // Create new campaign
                const { error } = await supabase
                    .from('campaigns')
                    .insert([{
                        title: formData.title,
                        description: formData.description,
                        goal_amount: Number(formData.goal_amount),
                        image_url: formData.image_url,
                        raised_amount: 0,
                        is_active: true
                    }])

                if (error) throw error
            }

            // fetchCampaigns() // Not needed due to real-time subscription
            closeModal()
        } catch (error) {
            console.error('Error saving campaign:', error)
            alert('Error saving campaign: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return

        try {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', id)

            if (error) throw error

            // fetchCampaigns() // Not needed due to real-time subscription
        } catch (error) {
            console.error('Error deleting campaign:', error)
            alert('Error deleting campaign: ' + error.message)
        }
    }

    const openModal = (campaign = null) => {
        if (campaign) {
            setEditingCampaign(campaign)
            setFormData({
                title: campaign.title,
                description: campaign.description || '',
                goal_amount: campaign.goal_amount.toString(),
                image_url: campaign.image_url || ''
            })
        } else {
            setEditingCampaign(null)
            setFormData({ title: '', description: '', goal_amount: '', image_url: '' })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingCampaign(null)
        setFormData({ title: '', description: '', goal_amount: '', image_url: '' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Campaigns</h2>
                    <p className="text-gray-500 mt-1">Manage your fundraising campaigns</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Create Campaign</span>
                    <span className="sm:hidden">Create</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {campaigns.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No campaigns yet</h3>
                        <p className="text-gray-500 mb-6">Create your first campaign to start raising funds.</p>
                        <button
                            onClick={() => openModal()}
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Create Campaign &rarr;
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Details</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors group animate-in fade-in duration-300">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {campaign.image_url && (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img src={campaign.image_url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{campaign.title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: campaign.description?.substring(0, 50) + '...' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-48">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium text-gray-900">₹{Number(campaign.raised_amount || 0).toLocaleString()}</span>
                                                        <span className="text-gray-500">of ₹{Number(campaign.goal_amount).toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(campaign.id, campaign.is_active)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${campaign.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${campaign.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                    {campaign.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(campaign)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(campaign.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
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

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {campaigns.map((campaign) => (
                                <div key={campaign.id} className="p-4">
                                    <div className="flex items-start gap-4 mb-3">
                                        {campaign.image_url && (
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={campaign.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{campaign.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    onClick={() => toggleStatus(campaign.id, campaign.is_active)}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${campaign.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {campaign.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openModal(campaign)}
                                                className="p-2 text-gray-400 hover:text-blue-600"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(campaign.id)}
                                                className="p-2 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Goal</span>
                                            <span className="font-medium text-gray-900">₹{Number(campaign.goal_amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Raised</span>
                                            <span className="font-medium text-blue-600">₹{Number(campaign.raised_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Education for All"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <div className="h-64 mb-12">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        className="h-48"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.goal_amount}
                                        onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., 50000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Image</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="url"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Image URL"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={uploading}
                                            />
                                            <button
                                                type="button"
                                                className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                                disabled={uploading}
                                            >
                                                {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div> : <Upload className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.image_url && (
                                        <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
