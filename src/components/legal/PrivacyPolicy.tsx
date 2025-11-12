import React from 'react';
import { Shield, Lock, Eye, Database, FileCheck, Users } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import SEO from '../SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy Policy - Veridaq"
        description="Learn how Veridaq protects your data with bank-grade security and GDPR compliance for KYC and AML services."
      />
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-6">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Your Privacy is Our Priority
            </h1>
            <p className="text-xl text-neutral-600">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-primary-600" />
                1. Introduction
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Veridaq ApS ("Veridaq", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance platform.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                As a provider of compliance solutions, we handle sensitive personal data with the highest standards of security and in full compliance with GDPR, EU AMLR 2027, and other applicable data protection regulations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Database className="w-8 h-8 text-primary-600" />
                2. Information We Collect
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.1 Personal Identification Information</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                For KYC verification purposes, we may collect:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Full name, date of birth, nationality</li>
                <li>Government-issued identification documents (passport, national ID, driver's license)</li>
                <li>Proof of address documents</li>
                <li>Biometric data (facial recognition for identity verification)</li>
                <li>Contact information (email, phone number, address)</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.2 Business Information</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                For corporate clients and their customers:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Company registration details</li>
                <li>Ultimate beneficial ownership (UBO) information</li>
                <li>Business address and contact details</li>
                <li>Financial information relevant to AML screening</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.3 Transaction Data</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                For AML monitoring purposes:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Transaction history and patterns</li>
                <li>Source and destination of funds</li>
                <li>Risk assessment data</li>
                <li>Sanctions and PEP (Politically Exposed Persons) screening results</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.4 Technical Information</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>IP addresses and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Eye className="w-8 h-8 text-primary-600" />
                3. How We Use Your Information
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">3.1 Legal Basis for Processing</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We process your data based on:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Legal obligation:</strong> Compliance with AML/KYC regulations and EU AMLR 2027</li>
                <li><strong>Contractual necessity:</strong> To provide our verification and monitoring services</li>
                <li><strong>Legitimate interests:</strong> Fraud prevention and platform security</li>
                <li><strong>Consent:</strong> Where explicitly obtained for specific purposes</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">3.2 Purposes of Processing</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Identity verification and customer due diligence</li>
                <li>AML screening and transaction monitoring</li>
                <li>Risk assessment and fraud detection</li>
                <li>Regulatory reporting and compliance</li>
                <li>Service improvement and analytics</li>
                <li>Customer support and communication</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Lock className="w-8 h-8 text-primary-600" />
                4. Data Security
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We implement bank-grade security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Encryption:</strong> AES-256 encryption at rest and TLS 1.3 in transit</li>
                <li><strong>Access controls:</strong> Role-based access with multi-factor authentication</li>
                <li><strong>Infrastructure:</strong> ISO 27001 certified data centers in the EU</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                <li><strong>Audits:</strong> Regular third-party security audits and penetration testing</li>
                <li><strong>Data minimization:</strong> We only collect and retain data necessary for our services</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary-600" />
                5. Data Sharing and Disclosure
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.1 When We Share Data</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Our clients:</strong> Businesses using our platform for KYC/AML compliance</li>
                <li><strong>Regulatory authorities:</strong> When required by law or to report suspicious activities</li>
                <li><strong>Service providers:</strong> Trusted partners who assist in our operations (under strict data processing agreements)</li>
                <li><strong>Legal proceedings:</strong> When necessary to comply with legal obligations or protect our rights</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.2 International Transfers</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Your data is stored in EU data centers. Any transfers outside the EU are protected by:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>EU Standard Contractual Clauses</li>
                <li>Adequacy decisions by the EU Commission</li>
                <li>Other GDPR-compliant transfer mechanisms</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">6. Your Rights</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Under GDPR and applicable data protection laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Restriction:</strong> Limit how we use your data in certain circumstances</li>
                <li><strong>Data portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
                <li><strong>Lodge a complaint:</strong> With your local data protection authority</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                To exercise these rights, contact us at <a href="mailto:privacy@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">privacy@veridaq.com</a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">7. Data Retention</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We retain your data only as long as necessary:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>KYC records:</strong> 5 years after the end of the business relationship (EU AMLR requirement)</li>
                <li><strong>Transaction records:</strong> 5 years from the date of transaction</li>
                <li><strong>Suspicious activity reports:</strong> As required by local regulations</li>
                <li><strong>Technical logs:</strong> 12 months for security purposes</li>
                <li><strong>Marketing data:</strong> Until consent is withdrawn or 2 years of inactivity</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Maintain user sessions and authentication</li>
                <li>Analyze platform usage and improve our services</li>
                <li>Detect and prevent fraud</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                You can manage cookie preferences through your browser settings. However, disabling essential cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">9. Children's Privacy</h2>
              <p className="text-neutral-700 leading-relaxed">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-neutral-700 leading-relaxed">
                We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of material changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">11. Contact Information</h2>
              <div className="bg-neutral-50 p-6 rounded-xl">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  <strong>Data Controller:</strong><br />
                  Veridaq ApS<br />
                  Fruebjergvej 3<br />
                  2100 Copenhagen<br />
                  Denmark
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  <strong>Data Protection Officer:</strong><br />
                  Email: <a href="mailto:dpo@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">dpo@veridaq.com</a>
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  <strong>General Privacy Inquiries:</strong><br />
                  Email: <a href="mailto:privacy@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">privacy@veridaq.com</a><br />
                  Phone: <a href="tel:+4531272726" className="text-primary-600 hover:text-primary-700 font-semibold">+45 31 27 27 26</a>
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">12. Supervisory Authority</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                If you have concerns about how we handle your data, you have the right to lodge a complaint with the Danish Data Protection Agency:
              </p>
              <div className="bg-neutral-50 p-6 rounded-xl">
                <p className="text-neutral-700 leading-relaxed">
                  Datatilsynet<br />
                  Borgergade 28, 5<br />
                  1300 Copenhagen K<br />
                  Denmark<br />
                  Email: <a href="mailto:dt@datatilsynet.dk" className="text-primary-600 hover:text-primary-700 font-semibold">dt@datatilsynet.dk</a><br />
                  Website: <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-semibold">www.datatilsynet.dk</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
