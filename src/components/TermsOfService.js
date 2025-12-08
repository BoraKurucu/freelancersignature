import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: December 8, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using FreelancerSignature ("the Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            FreelancerSignature is an online email signature generator designed specifically for freelancers. The Service allows users to create, customize, save, and export professional email signatures for use in email communications.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you may be required to create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate and complete</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the intellectual property rights of others</li>
            <li>Create signatures containing false, misleading, or fraudulent information</li>
            <li>Distribute spam, malware, or other harmful content</li>
            <li>Impersonate any person or entity</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by FreelancerSignature and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You retain ownership of any content you create using the Service, including your signature designs. However, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content solely for the purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2>6. Free and Premium Services</h2>
          <p>
            The Service offers both free and premium tiers. Free accounts include a "Created with FreelancerSignature" attribution in generated signatures. Premium subscriptions remove this attribution and provide access to additional features.
          </p>
          <p>
            Premium subscription fees are billed in advance on a monthly or annual basis. Subscriptions automatically renew unless cancelled before the renewal date.
          </p>
        </section>

        <section>
          <h2>7. Refund Policy</h2>
          <p>
            Premium subscriptions may be eligible for a refund within 30 days of purchase if you are not satisfied with the Service. Refund requests should be submitted to our support team. After 30 days, no refunds will be issued for the current billing period.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FREELANCERSIGNATURE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless FreelancerSignature, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account and access to the Service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after changes are posted constitutes your acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FreelancerSignature operates, without regard to its conflict of law provisions.
          </p>
        </section>

      </div>
    </div>
  );
}

export default TermsOfService;

