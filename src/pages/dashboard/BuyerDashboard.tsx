import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Heart, Phone, User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PropertyCard, { type PropertyProps } from '../../components/features/PropertyCard';

const BuyerDashboard = () => {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('saved');
    const [savedProperties, setSavedProperties] = useState<PropertyProps[]>([]);
    const [contactedProperties, setContactedProperties] = useState<(PropertyProps & { leadDate?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    // Profile form state
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, activeTab]);

    const mapProperty = (p: any): PropertyProps => ({
        id: p.id,
        title: p.title,
        price: p.price,
        area: p.area,
        location: p.location,
        city: p.city,
        type: p.type,
        status: p.status,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        isVerified: p.is_verified,
        viewsCount: p.views_count || 0,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'saved') {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('property_id, properties:property_id(*)')
                    .eq('user_id', user!.id);
                if (error) throw error;
                const props = (data || [])
                    .map((f: any) => f.properties)
                    .filter(Boolean)
                    .map(mapProperty);
                setSavedProperties(props);
            } else if (activeTab === 'contacted') {
                const { data, error } = await supabase
                    .from('leads')
                    .select('created_at, property_id, properties:property_id(*)')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                const props = (data || [])
                    .map((l: any) => ({
                        ...mapProperty(l.properties),
                        leadDate: l.created_at
                    }))
                    .filter((p: any) => p.id);
                setContactedProperties(props);
            }
        } catch (error) {
            console.error('Error fetching buyer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (propertyId: string) => {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user!.id)
                .eq('property_id', propertyId);
            if (error) throw error;
            setSavedProperties(s => s.filter(p => p.id !== propertyId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const handleProfileSave = async () => {
        if (!user) return;
        setSaving(true);
        setSaveMessage('');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone: phone })
                .eq('id', user.id);
            if (error) throw error;
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-border">
                {[
                    { key: 'saved', label: 'Saved Properties', icon: <Heart className="h-4 w-4" /> },
                    { key: 'contacted', label: 'Contacted', icon: <Phone className="h-4 w-4" /> },
                    { key: 'profile', label: 'Profile Settings', icon: <User className="h-4 w-4" /> },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium ${activeTab === tab.key
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Saved Properties */}
            {activeTab === 'saved' && (
                <div>
                    {loading ? <div>Loading...</div> : savedProperties.length === 0 ? (
                        <Card className="p-10 text-center">
                            <CardContent className="flex flex-col items-center gap-4">
                                <Heart className="h-12 w-12 text-muted-foreground" />
                                <h3 className="text-xl font-semibold">No saved properties yet</h3>
                                <p className="text-muted-foreground">Browse listings and click the heart icon to save plots you're interested in.</p>
                                <Button asChild>
                                    <Link to="/">Browse Properties</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {savedProperties.map(p => (
                                <div key={p.id} className="relative group">
                                    <PropertyCard property={p} />
                                    <button
                                        onClick={() => removeFavorite(p.id)}
                                        className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Remove from saved"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Contacted Properties */}
            {activeTab === 'contacted' && (
                <div>
                    {loading ? <div>Loading...</div> : contactedProperties.length === 0 ? (
                        <Card className="p-10 text-center">
                            <CardContent className="flex flex-col items-center gap-4">
                                <Phone className="h-12 w-12 text-muted-foreground" />
                                <h3 className="text-xl font-semibold">No contacted properties yet</h3>
                                <p className="text-muted-foreground">When you request a callback or schedule a visit, they'll show up here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {contactedProperties.map(p => (
                                <div key={p.id}>
                                    <PropertyCard property={p} />
                                    {p.leadDate && (
                                        <p className="text-xs text-muted-foreground mt-1 pl-1">
                                            Contacted on {new Date(p.leadDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <Input type="text" value={profile?.role || ''} disabled className="bg-muted capitalize" />
                        </div>

                        {saveMessage && (
                            <div className={`text-sm px-4 py-2 rounded ${saveMessage.includes('success') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {saveMessage}
                            </div>
                        )}

                        <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                            {saving ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BuyerDashboard;
