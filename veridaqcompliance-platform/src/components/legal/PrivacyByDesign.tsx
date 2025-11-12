import React from 'react';
import { Shield, Lock, Eye, Minimize, CheckCircle, Server, Code, FileCheck } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import SEO from '../SEO';

const PrivacyByDesign: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy by Design - Veridaq"
        description="Learn how Veridaq implements Privacy by Design principles in our KYC and AML compliance platform."
      />
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-6">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Privacy by Design</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Privacy by Design
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Privacy and data protection are embedded into the core of our platform, not added as an afterthought
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600" />
                Our Commitment
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                At Veridaq, we don't just comply with privacy regulations - we exceed them. Privacy by Design is fundamental to how we build and operate our KYC and AML compliance platform. Every feature, every algorithm, and every process is designed with privacy and data protection at its core.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                We follow the seven foundational principles of Privacy by Design, as established by Dr. Ann Cavoukian, and go beyond GDPR requirements to ensure the highest standards of data protection.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">The Seven Principles</h2>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                    1. Proactive not Reactive; Preventative not Remedial
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    We anticipate and prevent privacy breaches before they happen rather than waiting for issues to occur.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Threat modeling and risk assessments during development</li>
                    <li>Automated security scanning and vulnerability testing</li>
                    <li>Regular penetration testing by independent security firms</li>
                    <li>Privacy Impact Assessments (PIAs) for all new features</li>
                    <li>Proactive monitoring and anomaly detection</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-accent-600" />
                    2. Privacy as the Default Setting
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    Maximum privacy protection is automatically applied - users don't need to take action to protect their data.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Encryption enabled by default for all data (AES-256)</li>
                    <li>Minimal data collection - we only request what's necessary</li>
                    <li>Automatic data retention limits and deletion</li>
                    <li>Strictest access controls applied automatically</li>
                    <li>Privacy-preserving settings enabled without user intervention</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <Code className="w-6 h-6 text-primary-600" />
                    3. Privacy Embedded into Design
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    Privacy is an essential component of core functionality, not a bolt-on feature.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Privacy considerations in every sprint and design review</li>
                    <li>Data minimization built into our AI algorithms</li>
                    <li>Pseudonymization and tokenization at the database level</li>
                    <li>Secure-by-default API design</li>
                    <li>Privacy-preserving machine learning techniques</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent-600" />
                    4. Full Functionality - Positive-Sum, not Zero-Sum
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    Privacy doesn't come at the expense of functionality - we achieve both.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Advanced AI that maintains accuracy while preserving privacy</li>
                    <li>Real-time AML monitoring without compromising data protection</li>
                    <li>Instant KYC verification with secure biometric matching</li>
                    <li>Comprehensive audit trails that respect privacy principles</li>
                    <li>Efficient compliance workflows that protect individual rights</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary-600" />
                    5. End-to-End Security - Full Lifecycle Protection
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    Data is protected throughout its entire lifecycle, from collection to deletion.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                    <li>Secure data collection via validated forms and APIs</li>
                    <li>Protected processing in isolated environments</li>
                    <li>Secure storage in ISO 27001 certified EU data centers</li>
                    <li>Certified secure deletion procedures</li>
                    <li>Automated retention policy enforcement</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-accent-600" />
                    6. Visibility and Transparency
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    Our practices are open and verifiable - no hidden data collection or processing.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Clear, accessible privacy documentation</li>
                    <li>Detailed data processing records available on request</li>
                    <li>Transparent AI decision-making with explainability features</li>
                    <li>Regular third-party audits and certifications</li>
                    <li>User-friendly dashboards showing data usage</li>
                    <li>Open communication about data breaches or incidents</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                    7. Respect for User Privacy
                  </h3>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    We keep user interests at the forefront and provide strong privacy defaults and controls.
                  </p>
                  <p className="text-neutral-700 leading-relaxed font-semibold mb-2">How we implement this:</p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Easy-to-use privacy controls and consent management</li>
                    <li>Simple procedures for exercising GDPR rights</li>
                    <li>Clear privacy notices in plain language</li>
                    <li>Dedicated privacy support team</li>
                    <li>Regular privacy training for all staff</li>
                    <li>Privacy-first culture embedded in our organization</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Server className="w-8 h-8 text-primary-600" />
                Technical Implementation
              </h2>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Data Minimization</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We collect only the minimum data necessary for KYC/AML compliance:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Intelligent forms that adapt based on risk level</li>
                <li>Dynamic data collection based on regulatory requirements</li>
                <li>Automated deletion of unnecessary data points</li>
                <li>Regular audits to identify and eliminate redundant data</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Pseudonymization and Anonymization</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Sensitive data is protected through advanced techniques:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Tokenization of personally identifiable information</li>
                <li>Hashing of sensitive identifiers</li>
                <li>Data segregation between identification and transaction data</li>
                <li>Anonymous analytics and reporting</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Access Controls</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Strict access management ensures data is only available to authorized personnel:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Role-based access control (RBAC)</li>
                <li>Principle of least privilege enforcement</li>
                <li>Multi-factor authentication (MFA) required</li>
                <li>Session management and automatic timeouts</li>
                <li>Comprehensive audit logging of all access</li>
              </ul>

              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Encryption</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Military-grade encryption protects your data:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>AES-256 encryption for data at rest</li>
                <li>TLS 1.3 for data in transit</li>
                <li>End-to-end encryption for sensitive communications</li>
                <li>Hardware security modules (HSMs) for key management</li>
                <li>Regular key rotation and cryptographic audits</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-primary-600" />
                Compliance and Certifications
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our commitment to Privacy by Design is validated through:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>GDPR Compliance:</strong> Full compliance with all GDPR requirements</li>
                <li><strong>ISO 27001:</strong> Information security management certification</li>
                <li><strong>ISO 27701:</strong> Privacy information management certification</li>
                <li><strong>SOC 2 Type II:</strong> Independent verification of security controls</li>
                <li><strong>EU AMLR 2027:</strong> Built to comply with upcoming regulations</li>
                <li><strong>Regular audits:</strong> Annual third-party privacy and security audits</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <Minimize className="w-8 h-8 text-primary-600" />
                Privacy-Preserving AI
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our AI models are designed with privacy at their core:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Differential privacy:</strong> AI training with privacy guarantees</li>
                <li><strong>Federated learning:</strong> Model training without centralizing sensitive data</li>
                <li><strong>Explainable AI:</strong> Transparent decision-making processes</li>
                <li><strong>Bias detection:</strong> Regular audits to prevent discriminatory outcomes</li>
                <li><strong>Data minimization:</strong> Models trained on minimal necessary data</li>
                <li><strong>Secure enclaves:</strong> Protected processing environments for sensitive operations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Continuous Improvement</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Privacy by Design is not a one-time implementation - it's an ongoing commitment:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li>Regular privacy training for all team members</li>
                <li>Privacy champions embedded in every development team</li>
                <li>Quarterly privacy reviews and risk assessments</li>
                <li>Active participation in privacy research and standards development</li>
                <li>Feedback mechanisms for privacy concerns and improvements</li>
                <li>Continuous monitoring of emerging privacy technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Your Privacy Rights</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Privacy by Design means making it easy for you to exercise your rights:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
                <li><strong>Self-service portal:</strong> Manage your privacy preferences online</li>
                <li><strong>Automated requests:</strong> Quick processing of access and deletion requests</li>
                <li><strong>Data portability:</strong> Export your data in standard formats</li>
                <li><strong>Consent management:</strong> Granular control over data use</li>
                <li><strong>Privacy support:</strong> Dedicated team to help with privacy questions</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Contact Our Privacy Team</h2>
              <div className="bg-neutral-50 p-6 rounded-xl">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Have questions about our Privacy by Design practices?
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  <strong>Data Protection Officer:</strong><br />
                  Email: <a href="mailto:dpo@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">dpo@veridaq.com</a>
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  <strong>Privacy Inquiries:</strong><br />
                  Email: <a href="mailto:privacy@veridaq.com" className="text-primary-600 hover:text-primary-700 font-semibold">privacy@veridaq.com</a><br />
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

export default PrivacyByDesign;
