import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, X, Eye, Trash2, Shield, Users, BarChart, FileText, TrendingUp, MapPin, DollarSign, Star, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState<Property[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [leads, setLeads] = useState<(Lead & { properties?: { title: string; city: string; location: string } | null })[]>([]);
    const [leadFilter, setLeadFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        activeListings: 0,
        pendingApprovals: 0,
        totalLeads: 0,
        newLeadsToday: 0,
        topViewedPlots: [] as Property[],
        cityDemand: [] as { name: string, count: number, percentage: number }[],
        budgetDemand: [] as { range: string, count: number, percentage: number }[]
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'listings') {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setListings(data || []);
            } else if (activeTab === 'users') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setUsers(data || []);
            } else if (activeTab === 'leads') {
                const { data, error } = await supabase
                    .from('leads')
                    .select('*, properties:property_id(title, city, location)')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setLeads((data as any) || []);
            } else if (activeTab === 'analytics') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const [
                    { data: profiles },
                    { data: properties },
                    { data: allLeads },
                    { data: visitors }
                ] = await Promise.all([
                    supabase.from('profiles').select('*'),
                    supabase.from('properties').select('*'),
                    supabase.from('leads').select('created_at'),
                    supabase.from('visitors').select('city_interest, budget_range')
                ]);

                const userList = (profiles as Profile[]) || [];
                const totalUsers = userList.length;
                const totalBuyers = userList.filter(u => u.role === 'buyer').length;
                const totalSellers = userList.filter(u => u.role === 'seller').length;

                const propList = (properties as Property[]) || [];
                const activeListings = propList.filter(p => p.status === 'available').length;
                const pendingApprovals = propList.filter(p => p.status === 'pending').length;

                const topViewedPlots = [...propList]
                    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                    .slice(0, 5);

                const leadList = allLeads || [];
                const totalLeads = leadList.length;
                const newLeadsToday = leadList.filter(l => new Date(l.created_at) >= today).length;

                const visitorList = (visitors as { city_interest: string | null; budget_range: string | null }[]) || [];

                const cityCounts: Record<string, number> = {};
                visitorList.forEach(v => {
                    if (v.city_interest) {
                        cityCounts[v.city_interest] = (cityCounts[v.city_interest] || 0) + 1;
                    }
                });
                const totalCities = Object.values(cityCounts).reduce((a, b) => a + b, 0) || 1;
                const cityDemand = Object.entries(cityCounts)
                    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalCities) * 100) }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6);

                const budgetCounts: Record<string, number> = {};
                visitorList.forEach(v => {
                    if (v.budget_range) {
                        budgetCounts[v.budget_range] = (budgetCounts[v.budget_range] || 0) + 1;
                    }
                });
                const totalBudgets = Object.values(budgetCounts).reduce((a, b) => a + b, 0) || 1;
                const budgetDemand = Object.entries(budgetCounts)
                    .map(([range, count]) => ({ range, count, percentage: Math.round((count / totalBudgets) * 100) }))
                    .sort((a, b) => b.count - a.count);

                setStats({
                    totalUsers,
                    totalBuyers,
                    totalSellers,
                    activeListings,
                    pendingApprovals,
                    totalLeads,
                    newLeadsToday,
                    topViewedPlots,
                    cityDemand,
                    budgetDemand
                });
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateListingStatus = async (id: string, updates: Partial<Pick<Property, 'status' | 'is_verified' | 'is_featured'>>) => {
        try {
            const { error } = await supabase.from('properties').update(updates).eq('id', id);
            if (error) throw error;
            setListings(listings.map(l => l.id === id ? { ...l, ...updates } : l));
        } catch (error) {
            console.error('Error updating listing:', error);
            alert('Failed to update listing');
        }
    };

    const deleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting listing:', error);
        }
    };

    const updateLeadStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
        try {
            const { error } = await supabase.from('leads').update({ status }).eq('id', id);
            if (error) throw error;
            setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('Failed to update lead');
        }
    };

    const filteredLeads = leadFilter === 'all' ? leads : leads.filter(l => l.status === leadFilter);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                <p className="text-muted-foreground">Manage platform content, users, and leads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <Card className="md:col-span-1 h-fit">
                    <CardContent className="p-4 space-y-2">
                        <Button
                            variant={activeTab === 'listings' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('listings')}
                        >
                            <FileText className="mr-2 h-4 w-4" /> Listings
                        </Button>
                        <Button
                            variant={activeTab === 'users' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('users')}
                        >
                            <Users className="mr-2 h-4 w-4" /> Users
                        </Button>
                        <Button
                            variant={activeTab === 'leads' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('leads')}
                        >
                            <Phone className="mr-2 h-4 w-4" /> Leads
                        </Button>
                        <Button
                            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart className="mr-2 h-4 w-4" /> Analytics
                        </Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-4">
                    {/* LISTINGS TAB */}
                    {activeTab === 'listings' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Listings ({listings.length})</h2>
                            {loading ? <div>Loading...</div> : (
                                <div className="grid gap-4">
                                    {listings.map(property => (
                                        <Card key={property.id} className="flex flex-col md:flex-row gap-4 p-4 items-start md:items-center">
                                            <img
                                                src={property.images?.[0] || 'https://via.placeholder.com/150'}
                                                alt={property.title}
                                                className="w-24 h-24 object-cover rounded-md"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{property.title}</h3>
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    {property.location}, {property.city} • ₹{(property.price / 100000).toFixed(2)} L
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className={`text-xs px-2 py-1 rounded capitalize ${property.status === 'available' ? 'bg-green-100 text-green-700' :
                                                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            property.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {property.status}
                                                    </span>
                                                    {property.is_verified && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Verified</span>}
                                                    {property.is_featured && <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">Featured</span>}
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">{property.views_count} views • {property.leads_count} leads</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap self-end md:self-center">
                                                {property.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateListingStatus(property.id, { status: 'available' })} title="Approve">
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateListingStatus(property.id, { status: 'rejected' })} title="Reject">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {property.status === 'available' && (
                                                    <Button size="sm" variant="outline" className="text-gray-600 hover:bg-gray-50" onClick={() => updateListingStatus(property.id, { status: 'sold' })} title="Mark Sold">
                                                        Sold
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`${property.is_featured ? 'text-amber-600 bg-amber-50' : 'text-slate-600'} hover:bg-amber-50`}
                                                    onClick={() => updateListingStatus(property.id, { is_featured: !property.is_featured })}
                                                    title="Toggle Featured"
                                                >
                                                    <Star className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`${property.is_verified ? 'text-blue-600 bg-blue-50' : 'text-slate-600'} hover:bg-blue-50`}
                                                    onClick={() => updateListingStatus(property.id, { is_verified: !property.is_verified })}
                                                    title="Toggle Verification"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => deleteListing(property.id)} title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                    {listings.length === 0 && <p className="text-muted-foreground">No listings found.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">User Management ({users.length})</h2>
                            {loading ? <div>Loading...</div> : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="rounded-md border overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/50">
                                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Name</th>
                                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Email</th>
                                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Phone</th>
                                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Role</th>
                                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Joined</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map(user => (
                                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                                            <td className="p-4 font-medium">{user.full_name || 'N/A'}</td>
                                                            <td className="p-4 text-muted-foreground">{user.email}</td>
                                                            <td className="p-4">{user.phone || 'N/A'}</td>
                                                            <td className="p-4 capitalize">{user.role}</td>
                                                            <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* LEADS TAB */}
                    {activeTab === 'leads' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <h2 className="text-2xl font-bold">Lead Management ({leads.length})</h2>
                                <div className="flex gap-2">
                                    {(['all', 'new', 'contacted', 'closed'] as const).map(f => (
                                        <Button
                                            key={f}
                                            size="sm"
                                            variant={leadFilter === f ? 'default' : 'outline'}
                                            onClick={() => setLeadFilter(f)}
                                            className="capitalize"
                                        >
                                            {f}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            {loading ? <div>Loading...</div> : (
                                <div className="grid gap-4">
                                    {filteredLeads.map(lead => (
                                        <Card key={lead.id} className="p-4">
                                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                                                        <span className={`text-xs px-2 py-1 rounded capitalize ${lead.status === 'new' ? 'bg-green-100 text-green-700' :
                                                            lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {lead.status}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 capitalize">
                                                            {lead.type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                                                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>
                                                        {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>}
                                                    </div>
                                                    {lead.properties && (
                                                        <div className="text-sm text-slate-600">
                                                            <span className="font-medium">Property:</span> {lead.properties.title} — {lead.properties.location}, {lead.properties.city}
                                                        </div>
                                                    )}
                                                    {lead.message && <p className="text-sm text-muted-foreground mt-1 italic">"{lead.message}"</p>}
                                                    <p className="text-xs text-muted-foreground mt-2">{new Date(lead.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2 self-end md:self-center">
                                                    {lead.status !== 'contacted' && (
                                                        <Button size="sm" variant="outline" onClick={() => updateLeadStatus(lead.id, 'contacted')} className="text-blue-600">
                                                            Mark Contacted
                                                        </Button>
                                                    )}
                                                    {lead.status !== 'closed' && (
                                                        <Button size="sm" variant="outline" onClick={() => updateLeadStatus(lead.id, 'closed')} className="text-gray-600">
                                                            Close
                                                        </Button>
                                                    )}
                                                    {lead.status === 'closed' && (
                                                        <Button size="sm" variant="outline" onClick={() => updateLeadStatus(lead.id, 'new')} className="text-green-600">
                                                            Reopen
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    {filteredLeads.length === 0 && <p className="text-muted-foreground">No leads found.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold">Platform Analytics</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                                            <h3 className="text-2xl font-bold">{stats.activeListings} / {stats.activeListings + stats.pendingApprovals}</h3>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </CardContent>
                                    <div className="px-6 pb-4">
                                        <div className="text-xs text-yellow-600 font-medium">
                                            {stats.pendingApprovals} Pending Approval
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                                        </div>
                                        <div className="p-2 bg-purple-100 rounded-full">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </CardContent>
                                    <div className="px-6 pb-4">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{stats.totalBuyers} Buyers</span>
                                            <span>{stats.totalSellers} Sellers</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                                            <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                    </CardContent>
                                    <div className="px-6 pb-4">
                                        <div className="text-xs text-green-600 font-medium">
                                            +{stats.newLeadsToday} Today
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Top City</p>
                                            <h3 className="text-lg font-bold truncate max-w-[120px]">
                                                {stats.cityDemand[0]?.name || 'N/A'}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-orange-100 rounded-full">
                                            <MapPin className="h-5 w-5 text-orange-600" />
                                        </div>
                                    </CardContent>
                                    <div className="px-6 pb-4">
                                        <div className="text-xs text-muted-foreground">
                                            Most Searched
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-blue-600" /> Most Viewed Plots
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {stats.topViewedPlots.map((plot, i) => (
                                                <div key={plot.id} className="flex items-center gap-4 border-b last:border-0 pb-3 last:pb-0">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded font-bold text-slate-500">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium truncate">{plot.title}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{plot.location}, {plot.city}</p>
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-700">
                                                        {plot.views_count} views
                                                    </div>
                                                </div>
                                            ))}
                                            {stats.topViewedPlots.length === 0 && <p className="text-sm text-muted-foreground">No property views yet.</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-orange-600" /> City Demand (Heatmap)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {stats.cityDemand.map((city, i) => (
                                                <div key={city.name} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{city.name}</span>
                                                        <span className="text-muted-foreground">{city.count} hits</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-orange-400' : 'bg-orange-300'}`}
                                                            style={{ width: `${city.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {stats.cityDemand.length === 0 && <p className="text-sm text-muted-foreground">No analytics data available yet.</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-green-600" /> Budget Range Interest
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {stats.budgetDemand.map((budget) => (
                                                <div key={budget.range} className="bg-slate-50 p-4 rounded-lg border">
                                                    <div className="text-sm text-muted-foreground mb-1">{budget.range}</div>
                                                    <div className="text-xl font-bold text-slate-800">{budget.count} <span className="text-xs font-normal text-slate-500">requests</span></div>
                                                    <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{ width: `${budget.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {stats.budgetDemand.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No budget preference data available.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
