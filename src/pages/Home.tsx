import React, { useEffect, useState } from 'react';
import PropertyCard, { type PropertyProps } from '../components/features/PropertyCard';
import Hero from '../components/features/Hero';
import SEO from '../components/layout/SEO';
import { Card, CardContent } from '../components/ui/Card';
import { MapPin, Flame, Clock, Eye, ShieldCheck, CornerDownRight, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Home = () => {
    const [featured, setFeatured] = useState<PropertyProps[]>([]);
    const [recent, setRecent] = useState<PropertyProps[]>([]);
    const [verified, setVerified] = useState<PropertyProps[]>([]);
    const [cornerPlots, setCornerPlots] = useState<PropertyProps[]>([]);
    const [budgetFriendly, setBudgetFriendly] = useState<PropertyProps[]>([]);
    const [newThisWeek, setNewThisWeek] = useState<PropertyProps[]>([]);
    const [mostViewed, setMostViewed] = useState<PropertyProps[]>([]);
    const [popularAreas, setPopularAreas] = useState<{ area: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

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

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const [
                { data: featuredData },
                { data: recentData },
                { data: verifiedData },
                { data: cornerData },
                { data: budgetData },
                { data: weekData },
                { data: viewedData },
                { data: areasData }
            ] = await Promise.all([
                supabase.from('properties').select('*').eq('is_featured', true).eq('status', 'available').limit(4),
                supabase.from('properties').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(4),
                supabase.from('properties').select('*').eq('is_verified', true).eq('status', 'available').limit(4),
                supabase.from('properties').select('*').eq('corner_plot', true).eq('status', 'available').limit(4),
                supabase.from('properties').select('*').eq('status', 'available').lte('price', 5000000).order('price', { ascending: true }).limit(4),
                supabase.from('properties').select('*').eq('status', 'available').gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false }).limit(4),
                supabase.from('properties').select('*').eq('status', 'available').order('views_count', { ascending: false }).limit(4),
                supabase.rpc('get_popular_areas')
            ]);

            setFeatured((featuredData || []).map(mapProperty));
            setRecent((recentData || []).map(mapProperty));
            setVerified((verifiedData || []).map(mapProperty));
            setCornerPlots((cornerData || []).map(mapProperty));
            setBudgetFriendly((budgetData || []).map(mapProperty));
            setNewThisWeek((weekData || []).map(mapProperty));
            setMostViewed((viewedData || []).map(mapProperty));
            setPopularAreas(areasData || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const Section = ({ icon, title, children, accent = 'text-primary' }: { icon: React.ReactNode, title: string, children: React.ReactNode, accent?: string }) => (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className={accent}>{icon}</div>
                    <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                </div>
                {children}
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-lg text-muted-foreground">Loading properties...</div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Find Your Perfect Plot" description="Browse verified residential & commercial plots. Direct owner contacts, transparent pricing." />
            <Hero />

            {/* Featured Plots */}
            {featured.length > 0 && (
                <Section icon={<Flame className="h-6 w-6" />} title="Featured Plots" accent="text-orange-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* New This Week */}
            {newThisWeek.length > 0 && (
                <Section icon={<Clock className="h-6 w-6" />} title="New This Week" accent="text-teal-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newThisWeek.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* Most Viewed */}
            {mostViewed.length > 0 && (
                <Section icon={<Eye className="h-6 w-6" />} title="Most Viewed Plots" accent="text-indigo-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mostViewed.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* Recently Added */}
            {recent.length > 0 && (
                <Section icon={<Clock className="h-6 w-6" />} title="Recently Added" accent="text-blue-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recent.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* Verified Listings */}
            {verified.length > 0 && (
                <Section icon={<ShieldCheck className="h-6 w-6" />} title="Verified Listings" accent="text-green-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {verified.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* Corner Plots */}
            {cornerPlots.length > 0 && (
                <Section icon={<CornerDownRight className="h-6 w-6" />} title="Corner Plots" accent="text-purple-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cornerPlots.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}

            {/* Popular Areas */}
            {popularAreas.length > 0 && (
                <section className="py-12 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-8">
                            <MapPin className="h-6 w-6 text-red-500" />
                            <h2 className="text-2xl md:text-3xl font-bold">Popular Areas</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {popularAreas.map(area => (
                                <Card key={area.area} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-red-400" />
                                            <span className="font-medium">{area.area}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground bg-slate-100 px-2 py-1 rounded">{area.count} plots</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Budget Friendly */}
            {budgetFriendly.length > 0 && (
                <Section icon={<DollarSign className="h-6 w-6" />} title="Under ₹50 Lacs" accent="text-green-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {budgetFriendly.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </Section>
            )}
        </>
    );
};

export default Home;
