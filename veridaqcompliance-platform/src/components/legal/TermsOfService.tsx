import React from 'react';
import { FileText, AlertCircle, Scale, Shield, CheckCircle, XCircle } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import SEO from '../SEO';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms of Service - Veridaq"
        description="Review Veridaq's terms of service for our KYC and AML compliance platform."
      />
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-6">
              <FileText className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Terms of Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-neutral-600">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Scale className="w-8 h-8 text-primary-600" />
                1. Agreement to Terms
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client", "you", or "your") and Veridaq ApS ("Veridaq", "we", "us", or "our") regarding your access to and use of our KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance platform and related services (collectively, the "Services").
              </p>
              <p className="text-neutral-700 leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of these Terms, you must not use our Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary-600" />
                2. Description of Services
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.1 KYC Lite</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our KYC Lite service provides:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Automated identity verification</li>
                <li>Document authentication and validation</li>
                <li>Biometric verification (facial recognition)</li>
                <li>Address verification</li>
                <li>Basic risk assessment</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.2 Complete AML Suite</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our Complete AML Suite includes:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Real-time transaction monitoring</li>
                <li>Sanctions and PEP (Politically Exposed Persons) screening</li>
                <li>Adverse media screening</li>
                <li>Risk scoring and profiling</li>
                <li>Suspicious activity detection and reporting</li>
                <li>Enhanced due diligence (EDD) workflows</li>
                <li>EU AMLR 2027 compliance features</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">2.3 Service Availability</h3>
              <p className="text-neutral-700 leading-relaxed">
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the Services with reasonable notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary-600" />
                3. Eligibility and Account Registration
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">3.1 Eligibility</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                To use our Services, you must:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Be a legally registered business entity</li>
                <li>Have the authority to bind your organization to these Terms</li>
                <li>Operate in a jurisdiction where our Services are legally permitted</li>
                <li>Not be listed on any sanctions lists or designated as a prohibited entity</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">3.2 Account Security</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities conducted through your account</li>
                <li>Immediately notifying us of any unauthorized access</li>
                <li>Implementing appropriate security measures on your end</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600" />
                4. Client Obligations and Acceptable Use
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">4.1 Lawful Use</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You agree to use our Services only for:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Legitimate compliance and regulatory purposes</li>
                <li>Verifying the identity of your customers and monitoring transactions as required by law</li>
                <li>Compliance with applicable AML/KYC regulations in your jurisdiction</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">4.2 Prohibited Activities</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You must not:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Use the Services for any illegal purpose or in violation of any laws</li>
                <li>Attempt to circumvent, disable, or interfere with security features</li>
                <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Use the Services to harass, abuse, or harm others</li>
                <li>Resell or sublicense access to the Services without authorization</li>
                <li>Overload or attempt to damage our infrastructure</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">4.3 Data Quality</h3>
              <p className="text-neutral-700 leading-relaxed">
                You are responsible for ensuring that all data submitted to our platform is accurate, complete, and obtained lawfully with appropriate consents.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">5. Fees and Payment</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.1 Pricing</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Fees are based on your selected plan and usage tier, as detailed in your service agreement. Pricing includes:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Monthly or annual subscription fees</li>
                <li>Per-verification charges (if applicable)</li>
                <li>Premium features and add-ons</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.2 Billing</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Fees are billed in advance for subscription services</li>
                <li>Usage-based fees are billed monthly in arrears</li>
                <li>All prices are in EUR unless otherwise specified</li>
                <li>Prices exclude applicable VAT and taxes</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.3 Payment Terms</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Payment is due within 14 days of invoice date</li>
                <li>Late payments may incur interest charges</li>
                <li>We reserve the right to suspend Services for non-payment</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">5.4 Refunds</h3>
              <p className="text-neutral-700 leading-relaxed">
                Fees are non-refundable except where required by law or in cases of significant service failure on our part.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">6. Data Processing and Privacy</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our processing of personal data is governed by:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Our Privacy Policy</li>
                <li>The Data Processing Agreement (DPA) included in your service agreement</li>
                <li>GDPR and applicable data protection laws</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                You act as the data controller, and we act as the data processor for customer data submitted through the platform. You are responsible for obtaining necessary consents and providing appropriate privacy notices to your customers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">7. Intellectual Property</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">7.1 Our IP</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                All rights, title, and interest in the Services, including:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Software, algorithms, and AI models</li>
                <li>Platform design and user interface</li>
                <li>Trademarks, logos, and branding</li>
                <li>Documentation and training materials</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed mb-4">
                remain the exclusive property of Veridaq. These Terms grant you only a limited, non-exclusive, non-transferable license to use the Services.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">7.2 Your Data</h3>
              <p className="text-neutral-700 leading-relaxed">
                You retain all rights to your customer data. You grant us a limited license to process this data solely to provide the Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">8. Warranties and Disclaimers</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">8.1 Service Quality</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We warrant that our Services will:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Perform substantially as described in our documentation</li>
                <li>Be provided with reasonable skill and care</li>
                <li>Comply with applicable AML/KYC regulations</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">8.2 Disclaimers</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Except as expressly stated:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Services are provided "as is" without warranties of any kind</li>
                <li>We do not guarantee that our Services will meet all your specific requirements</li>
                <li>We do not warrant that the Services will be error-free or uninterrupted</li>
                <li>AI-based results are probabilistic and should be reviewed by qualified personnel</li>
                <li>You remain responsible for your own compliance obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-primary-600" />
                9. Limitation of Liability
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">9.1 Liability Cap</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, our total liability for any claims arising from or related to these Terms or the Services shall not exceed the fees paid by you in the 12 months preceding the claim.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">9.2 Excluded Damages</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Data loss or corruption (beyond our backup obligations)</li>
                <li>Regulatory fines or penalties imposed on you</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">9.3 Exceptions</h3>
              <p className="text-neutral-700 leading-relaxed">
                Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded by law.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">10. Indemnification</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You agree to indemnify and hold Veridaq harmless from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or regulations</li>
                <li>Your violation of third-party rights</li>
                <li>Your use of the Services in an unauthorized manner</li>
                <li>Data you submit to the platform</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">11. Term and Termination</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">11.1 Term</h3>
              <p className="text-neutral-700 leading-relaxed">
                These Terms remain in effect for the duration of your subscription or service agreement.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">11.2 Termination by You</h3>
              <p className="text-neutral-700 leading-relaxed">
                You may terminate your account by providing 30 days written notice. Fees for the current billing period are non-refundable.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">11.3 Termination by Us</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We may terminate or suspend your access immediately if:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>You breach these Terms</li>
                <li>Your account is used for illegal activities</li>
                <li>You fail to pay fees when due</li>
                <li>Required by law or regulatory authorities</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">11.4 Effect of Termination</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Your access to the Services will cease</li>
                <li>We will retain data as required by law (typically 5 years for compliance records)</li>
                <li>You may request an export of your data within 30 days</li>
                <li>Outstanding fees remain due and payable</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">12. Confidentiality</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Both parties agree to maintain the confidentiality of:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Customer data and verification results</li>
                <li>Business terms and pricing information</li>
                <li>Technical details and platform architecture</li>
                <li>Any information marked as confidential</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">13. Governing Law and Disputes</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">13.1 Governing Law</h3>
              <p className="text-neutral-700 leading-relaxed">
                These Terms are governed by the laws of Denmark, without regard to conflict of law principles.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">13.2 Dispute Resolution</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Disputes should first be resolved through good-faith negotiations. If unresolved within 30 days, either party may pursue:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Mediation before proceeding to litigation</li>
                <li>Jurisdiction in the courts of Copenhagen, Denmark</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">14. General Provisions</h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">14.1 Changes to Terms</h3>
              <p className="text-neutral-700 leading-relaxed">
                We may modify these Terms with 30 days notice for material changes. Continued use after changes constitutes acceptance.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">14.2 Force Majeure</h3>
              <p className="text-neutral-700 leading-relaxed">
                Neither party is liable for delays or failures due to circumstances beyond reasonable control.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">14.3 Assignment</h3>
              <p className="text-neutral-700 leading-relaxed">
                You may not assign these Terms without our written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">14.4 Severability</h3>
              <p className="text-neutral-700 leading-relaxed">
                If any provision is found unenforceable, the remaining provisions remain in full effect.
              </p>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">14.5 Entire Agreement</h3>
              <p className="text-neutral-700 leading-relaxed">
                These Terms, together with your service agreement and our Privacy Policy, constitute the entire agreement between the parties.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">15. Contact Information</h2>
              <div className="bg-neutral-50 p-6 rounded-xl">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  <strong>Veridaq ApS</strong><br />
                  Fruebjergvej 3<br />
                  2100 Copenhagen<br />
                  Denmark
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  <strong>Legal Inquiries:</strong><br />
                  Email: <a href="mailto:legal@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">legal@veridaq.com</a>
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  <strong>General Contact:</strong><br />
                  Email: <a href="mailto:sales@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">sales@veridaq.com</a><br />
                  Phone: <a href="tel:+4531272726" className="text-primary-600 hover:text-primary-700 font-semibold">+45 31 27 27 26</a>
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

export default TermsOfService;
