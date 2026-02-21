import React, { useState } from 'react';
import { X, Phone, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    type: 'callback' | 'site_visit' | 'best_price' | 'whatsapp';
}

const LeadModal = ({ isOpen, onClose, propertyId, type }: LeadModalProps) => {
    const { user, profile } = useAuth();
    const [name, setName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Insert lead with user_id if logged in
            const { error } = await supabase.from('leads').insert({
                property_id: propertyId,
                user_id: user?.id || null,
                name,
                phone,
                email: email || null,
                message: message || null,
                type,
                status: 'new'
            } as any);

            if (error) throw error;

            // Increment leads_count on the property
            await supabase.rpc('increment_leads_count' as any, { property_id_input: propertyId });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setName(profile?.full_name || '');
                setPhone(profile?.phone || '');
                setMessage('');
            }, 2000);
        } catch (error) {
            console.error('Error submitting lead:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const config: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string }> = {
        callback: {
            title: 'Request a Callback',
            desc: 'Our team will call you within 30 minutes during business hours.',
            icon: <Phone className="h-6 w-6" />,
            color: 'bg-blue-50 text-blue-600'
        },
        site_visit: {
            title: 'Schedule Site Visit',
            desc: 'We\'ll arrange a visit at your convenience.',
            icon: <Calendar className="h-6 w-6" />,
            color: 'bg-purple-50 text-purple-600'
        },
        best_price: {
            title: 'Get Best Price',
            desc: 'Receive the best negotiated price from the seller.',
            icon: <DollarSign className="h-6 w-6" />,
            color: 'bg-green-50 text-green-600'
        },
        whatsapp: {
            title: 'Chat on WhatsApp',
            desc: 'We\'ll connect you with the seller via WhatsApp.',
            icon: <MessageSquare className="h-6 w-6" />,
            color: 'bg-emerald-50 text-emerald-600'
        }
    };

    const current = config[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className={`p-3 rounded-xl ${current.color}`}>
                            {current.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{current.title}</h2>
                            <p className="text-sm text-gray-500">{current.desc}</p>
                        </div>
                    </div>

                    {success ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-green-700 mb-1">Request Submitted!</h3>
                            <p className="text-sm text-gray-500">Our team will reach out to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <Input
                                    required
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    pattern="[0-9]{10}"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Any specific requirements..."
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                                        Submitting...
                                    </span>
                                ) : 'Submit Request'}
                            </Button>
                            <p className="text-xs text-center text-gray-400">
                                By submitting, you agree to our privacy policy.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadModal;
