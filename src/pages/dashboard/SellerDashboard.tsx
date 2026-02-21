import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Eye, Users, TrendingUp, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

const SellerDashboard = () => {
    const { user, profile } = useAuth();
    const [listings, setListings] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchListings();
    }, [user]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('owner_id', user!.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Failed to delete listing. You may only delete your own listings.');
        }
    };

    const totalViews = listings.reduce((acc, l) => acc + (l.views_count || 0), 0);
    const totalLeads = listings.reduce((acc, l) => acc + (l.leads_count || 0), 0);
    const activeCount = listings.filter(l => l.status === 'available').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'sold': return 'bg-gray-100 text-gray-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
                    <p className="text-muted-foreground">Welcome, {profile?.full_name?.split(' ')[0] || 'Seller'}!</p>
                </div>
                <Button asChild>
                    <Link to="/post-property">
                        <Plus className="w-4 h-4 mr-2" /> Post New Property
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                            <h3 className="text-3xl font-bold">{activeCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                            <h3 className="text-3xl font-bold">{totalViews}</h3>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <Eye className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                            <h3 className="text-3xl font-bold">{totalLeads}</h3>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Listings */}
            <div>
                <h2 className="text-2xl font-bold mb-4">My Listings ({listings.length})</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : listings.length === 0 ? (
                    <Card className="p-10 text-center">
                        <CardContent className="flex flex-col items-center gap-4">
                            <Plus className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-semibold">No listings yet</h3>
                            <p className="text-muted-foreground">Start by posting your first property listing.</p>
                            <Button asChild>
                                <Link to="/post-property">Post Your First Property</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {listings.map(listing => (
                            <Card key={listing.id} className="flex flex-col md:flex-row gap-4 p-4 items-start md:items-center">
                                <img
                                    src={listing.images?.[0] || 'https://via.placeholder.com/100'}
                                    alt={listing.title}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <Link to={`/property/${listing.id}`} className="font-semibold text-lg hover:text-primary truncate block">
                                        {listing.title}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">{listing.location}, {listing.city}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                                        {listing.is_verified && <Badge className="bg-blue-100 text-blue-700">Verified</Badge>}
                                        {listing.is_featured && <Badge className="bg-amber-100 text-amber-700">Featured</Badge>}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="font-bold text-lg">₹{(listing.price / 100000).toFixed(2)} L</div>
                                    <div className="text-xs text-muted-foreground">
                                        {listing.views_count} views • {listing.leads_count} leads
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteListing(listing.id)} title="Delete listing" className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
