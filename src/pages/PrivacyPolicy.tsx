import React from "react";
import SEO from "../components/layout/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO title="Privacy Policy" />
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, post a listing, or contact a seller. This
            includes your name, email address, phone number, and property
            details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, to process your transactions, and to communicate with
            you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            3. Information Sharing
          </h2>
          <p>
            We may share your information with sellers or buyers when you
            express interest in a property. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            4. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at contact@bookmycorner.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
