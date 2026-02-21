import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, MapPin, Ruler, FileText, IndianRupee, Image as ImageIcon, User, Upload, X } from 'lucide-react';

const PostProperty = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initial State matching the new schema
    const [formData, setFormData] = useState({
        // Step 1: Location
        city: '',
        location: '',
        landmark: '',
        latitude: '',
        longitude: '',

        // Step 2: Plot Details
        title: '',
        description: '',
        type: 'plot',
        area: '', // sq.ft
        length: '',
        width: '',
        facing: 'North',
        corner_plot: false,
        road_width_front: '',
        road_width_back: '',

        // Step 3: Legal
        layout_approval_status: 'pending', // pending, approved
        registration_available: false,
        documents_available: false,

        // Step 4: Pricing
        price: '',
        negotiable: true,

        // Step 5: Images
        images: [] as string[],

        // Step 6: Seller Info (Auto-filled but editable)
        seller_name: '',
        seller_phone: '',
        seller_email: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                seller_name: profile.full_name || '',
                seller_email: profile.email || '',
                seller_phone: profile.phone || ''
            }));
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const uploadedUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(data.publicUrl);
            }

            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('properties').insert({
                owner_id: user.id,
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                area: Number(formData.area),
                location: formData.location,
                city: formData.city,
                // New Fields
                landmark: formData.landmark,
                length: formData.length ? Number(formData.length) : null,
                width: formData.width ? Number(formData.width) : null,
                facing: formData.facing,
                corner_plot: formData.corner_plot,
                road_width_front: formData.road_width_front ? Number(formData.road_width_front) : null,
                road_width_back: formData.road_width_back ? Number(formData.road_width_back) : null,
                layout_approval_status: formData.layout_approval_status,
                registration_available: formData.registration_available,
                documents_available: formData.documents_available,
                negotiable: formData.negotiable,

                type: 'plot', // Forced as per requirement
                status: 'pending', // Default to pending
                images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800']
            } as any);

            if (error) throw error;
            alert('Property submitted for review!');
            navigate('/seller/dashboard');
        } catch (error) {
            console.error('Error posting property:', error);
            alert('Failed to post property');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Location', icon: MapPin },
        { number: 2, title: 'Dimensions', icon: Ruler },
        { number: 3, title: 'Legal', icon: FileText },
        { number: 4, title: 'Pricing', icon: IndianRupee },
        { number: 5, title: 'Images', icon: ImageIcon },
        { number: 6, title: 'Review', icon: CheckCircle2 },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Stepper */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex justify-between items-center min-w-[600px] relative z-0">
                    {steps.map((s, i) => (
                        <div key={s.number} className={`flex flex-col items-center flex-1 relative ${i < steps.length - 1 ? 'after:content-[""] after:h-[2px] after:w-full after:bg-border after:absolute after:top-5 after:left-[50%] after:-z-10' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${step >= s.number ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-medium ${step >= s.number ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{steps[step - 1].title}</CardTitle>
                    <CardDescription>Step {step} of 6</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Hyderabad" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Area / Locality</label>
                                    <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Gachibowli" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Landmark</label>
                                <Input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near City Hospital" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Listing Title</label>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Premium Corner Plot in Gated Community" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Plot Area (sq.ft)</label>
                                    <Input name="area" type="number" value={formData.area} onChange={handleChange} placeholder="2400" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Facing</label>
                                    <select name="facing" value={formData.facing} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3">
                                        <option value="North">North</option>
                                        <option value="South">South</option>
                                        <option value="East">East</option>
                                        <option value="West">West</option>
                                        <option value="North-East">North-East</option>
                                        <option value="North-West">North-West</option>
                                        <option value="South-East">South-East</option>
                                        <option value="South-West">South-West</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Length (ft)</label>
                                    <Input name="length" type="number" value={formData.length} onChange={handleChange} placeholder="60" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Width (ft)</label>
                                    <Input name="width" type="number" value={formData.width} onChange={handleChange} placeholder="40" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Road Width Front (ft)</label>
                                    <Input name="road_width_front" type="number" value={formData.road_width_front} onChange={handleChange} placeholder="40" />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <input type="checkbox" id="corner_plot" name="corner_plot" checked={formData.corner_plot} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                                    <label htmlFor="corner_plot" className="text-sm font-medium">Corner Plot</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Detailed description..." />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Layout Approval Status</label>
                                <select name="layout_approval_status" value={formData.layout_approval_status} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3">
                                    <option value="pending">Pending Approval</option>
                                    <option value="approved">HMDA / DTCP Approved</option>
                                    <option value="unapproved">Not Approved</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="registration_available" name="registration_available" checked={formData.registration_available} onChange={handleChange} className="h-4 w-4" />
                                    <label htmlFor="registration_available" className="text-sm">Registration Available Immediately</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="documents_available" name="documents_available" checked={formData.documents_available} onChange={handleChange} className="h-4 w-4" />
                                    <label htmlFor="documents_available" className="text-sm">All Legal Documents Available</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Price (₹)</label>
                                <Input name="price" type="number" value={formData.price} onChange={handleChange} required />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Price per sq.ft: ₹{formData.price && formData.area ? Math.round(Number(formData.price) / Number(formData.area)) : 0}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="negotiable" name="negotiable" checked={formData.negotiable} onChange={handleChange} className="h-4 w-4" />
                                <label htmlFor="negotiable" className="text-sm">Price is Negotiable</label>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative">
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                                <div className="flex flex-col items-center">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                    <p className="text-sm font-medium">Click to upload images</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                                </div>
                            </div>

                            {uploading && <div className="text-center text-sm text-muted-foreground">Uploading...</div>}

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                                            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-4">
                            <div className="bg-secondary/20 p-4 rounded-md space-y-2">
                                <h3 className="font-semibold text-lg flex items-center mb-4">
                                    <User className="w-5 h-5 mr-2" /> Seller Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <Input value={formData.seller_name} disabled className="bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone</label>
                                        <Input value={formData.seller_phone} disabled={!!profile?.phone} placeholder="Add phone in profile" className="bg-slate-100" />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-lg mb-4">Property Summary</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-medium">Title:</span> {formData.title}</p>
                                    <p><span className="font-medium">Type:</span> {formData.type}</p>
                                    <p><span className="font-medium">Location:</span> {formData.location}, {formData.city}</p>
                                    <p><span className="font-medium">Area:</span> {formData.area} sq.ft</p>
                                    <p><span className="font-medium">Price:</span> ₹{formData.price} {formData.negotiable ? '(Neg.)' : ''}</p>
                                    <p><span className="font-medium">Images:</span> {formData.images.length} uploaded</p>
                                </div>
                            </div>

                            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                                Note: Your listing will be reviewed by an admin before going live. This process usually takes 24 hours.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                    ) : (<div></div>)}

                    {step < 6 ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Listing'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default PostProperty;
