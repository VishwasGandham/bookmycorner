import React from 'react';
import SEO from '../components/layout/SEO';

const AboutUs: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <SEO title="About Us" />

            <h1 className="text-3xl font-bold mb-6">About BookMyCorner</h1>

            <div className="space-y-6 text-slate-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold mb-2 text-slate-900">Who We Are</h2>
                    <p>
                        BookMyCorner is a modern real estate platform focused on helping users discover,
                        shortlist, and purchase corner plots easily with transparency and trust.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2 text-slate-900">Our Mission</h2>
                    <p>
                        Our mission is to simplify plot discovery by providing verified listings,
                        powerful search tools, and direct communication between buyers and sellers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2 text-slate-900">What We Offer</h2>
                    <p>
                        We offer advanced property search, shortlist management, seller dashboards,
                        and tools that make real estate decisions faster and smarter.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2 text-slate-900">Why BookMyCorner</h2>
                    <p>
                        We focus specifically on corner plots — a premium category — ensuring better
                        visibility, value, and investment clarity for buyers.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;