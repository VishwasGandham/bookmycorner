import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { trackSearch } from './VisitorTracker';

const Hero = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [budget, setBudget] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        trackSearch(searchQuery, budget);
        const params = new URLSearchParams();
        if (searchQuery) params.set('city', searchQuery);
        if (budget) params.set('budget', budget);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="relative w-full bg-slate-900 text-white py-20 md:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                    Find Your Perfect Plot of Land
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
                    Explore thousands of verified plots, agricultural lands, and commercial properties in your preferred location.
                </p>

                <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-2 md:p-3 shadow-xl flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-200">
                        <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
                        <Input
                            type="text"
                            placeholder="Enter City, Locality or Project"
                            className="border-0 shadow-none focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-200">
                        <select
                            className="w-full bg-transparent border-0 text-slate-700 focus:ring-0 text-sm outline-none"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        >
                            <option value="">Budget</option>
                            <option value="0-10L">Below 10 Lacs</option>
                            <option value="10L-20L">10 - 20 Lacs</option>
                            <option value="20L-50L">20 - 50 Lacs</option>
                            <option value="50L-1Cr">50 Lacs - 1 Cr</option>
                            <option value="1Cr+">Above 1 Cr</option>
                        </select>
                    </div>
                    <Button size="lg" className="w-full md:w-auto px-8" type="submit">
                        <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                </form>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-300">
                    <span>Trending:</span>
                    <button onClick={() => { setSearchQuery('Bangalore'); }} className="hover:text-white underline">Plots in Bangalore</button>
                    <button onClick={() => { setSearchQuery('Agricultural'); }} className="hover:text-white underline">Agricultural Land</button>
                    <button onClick={() => navigate('/search?type=plot')} className="hover:text-white underline">Corner Plots</button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
