import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        
        <h1>Cookie Policy</h1>
        <p className="last-updated">Last Updated: December 8, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            FreelancerSignature ("we," "our," or "us") uses cookies and similar tracking technologies on our website and service ("the Service") to enhance your experience, analyze usage patterns, and improve our services.
          </p>
          <p>
            This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
          </p>
        </section>

        <section>
          <h2>2. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
          </p>
          <p>
            Cookies can be "persistent" (remain on your device until deleted or expired) or "session" cookies (deleted when you close your browser).
          </p>
        </section>

        <section>
          <h2>3. Types of Cookies We Use</h2>
          
          <h3>3.1 Essential Cookies</h3>
          <p>
            These cookies are necessary for the Service to function properly. They enable core functionality such as:
          </p>
          <ul>
            <li>User authentication and session management</li>
            <li>Remembering your preferences and settings</li>
            <li>Security features and fraud prevention</li>
            <li>Load balancing and performance optimization</li>
          </ul>
          <p>
            <strong>These cookies cannot be disabled</strong> as they are essential for the Service to work.
          </p>

          <h3>3.2 Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with the Service by collecting and reporting information anonymously. We use this information to:
          </p>
          <ul>
            <li>Analyze usage patterns and trends</li>
            <li>Improve website performance and user experience</li>
            <li>Identify popular features and areas for improvement</li>
            <li>Measure the effectiveness of our content</li>
          </ul>

          <h3>3.3 Preference Cookies</h3>
          <p>
            These cookies allow the Service to remember information about your preferences, such as:
          </p>
          <ul>
            <li>Language preferences</li>
            <li>Theme or display settings</li>
            <li>Previously viewed content</li>
            <li>Customized features and layouts</li>
          </ul>

          <h3>3.4 Functionality Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as:
          </p>
          <ul>
            <li>Remembering your saved signatures</li>
            <li>Storing draft content</li>
            <li>Maintaining your login state</li>
            <li>Providing personalized recommendations</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>
            We may also use third-party cookies from trusted partners to provide additional functionality:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
            <li><strong>Firebase:</strong> For authentication, database, and hosting services</li>
            <li><strong>Payment Processors:</strong> For secure payment processing (Gumroad)</li>
          </ul>
          <p>
            These third-party services have their own privacy policies and cookie practices. We encourage you to review their policies.
          </p>
        </section>

        <section>
          <h2>5. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li>To authenticate users and maintain secure sessions</li>
            <li>To remember your preferences and settings</li>
            <li>To analyze how the Service is used and improve performance</li>
            <li>To provide personalized content and features</li>
            <li>To prevent fraud and ensure security</li>
            <li>To support advertising and marketing efforts (if applicable)</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Cookie Choices</h2>
          
          <h3>6.1 Browser Settings</h3>
          <p>
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul>
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Delete existing cookies</li>
            <li>Set your browser to notify you when cookies are being set</li>
          </ul>
          <p>
            <strong>Note:</strong> Blocking or deleting cookies may impact your ability to use certain features of the Service. Essential cookies are required for the Service to function properly.
          </p>

          <h3>6.2 Browser-Specific Instructions</h3>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
          </ul>

          <h3>6.3 Opt-Out Tools</h3>
          <p>
            You can also opt out of certain third-party cookies:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Install the Google Analytics Opt-out Browser Add-on</li>
            <li><strong>Network Advertising Initiative:</strong> Visit www.networkadvertising.org/choices</li>
            <li><strong>Digital Advertising Alliance:</strong> Visit www.aboutads.info/choices</li>
          </ul>
        </section>

        <section>
          <h2>7. Local Storage and Similar Technologies</h2>
          <p>
            In addition to cookies, we may use other similar technologies such as:
          </p>
          <ul>
            <li><strong>Local Storage:</strong> To store larger amounts of data on your device</li>
            <li><strong>Session Storage:</strong> To store temporary data during your session</li>
            <li><strong>Web Beacons:</strong> Small images embedded in emails or web pages</li>
            <li><strong>Pixel Tags:</strong> To track email opens and website visits</li>
          </ul>
          <p>
            These technologies work similarly to cookies and can be managed through your browser settings.
          </p>
        </section>

        <section>
          <h2>8. Cookies We Set</h2>
          <p>Below is a list of the main cookies we use and their purposes:</p>
          
          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
            <thead>
              <tr style={{borderBottom: '2px solid #e0e0e0'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600'}}>Cookie Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600'}}>Purpose</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600'}}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom: '1px solid #f0f0f0'}}>
                <td style={{padding: '12px'}}>auth_token</td>
                <td style={{padding: '12px'}}>Maintains your login session</td>
                <td style={{padding: '12px'}}>Session</td>
              </tr>
              <tr style={{borderBottom: '1px solid #f0f0f0'}}>
                <td style={{padding: '12px'}}>user_preferences</td>
                <td style={{padding: '12px'}}>Stores your preferences and settings</td>
                <td style={{padding: '12px'}}>1 year</td>
              </tr>
              <tr style={{borderBottom: '1px solid #f0f0f0'}}>
                <td style={{padding: '12px'}}>signature_drafts</td>
                <td style={{padding: '12px'}}>Saves your draft signatures</td>
                <td style={{padding: '12px'}}>30 days</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>9. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
          <p>
            We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
          </p>
        </section>

        <section>
          <h2>10. More Information</h2>
          <p>
            For more information about cookies and how to manage them, you can visit:
          </p>
          <ul>
            <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a></li>
            <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">www.youronlinechoices.com</a></li>
          </ul>
          <p>
            If you have questions about our use of cookies, please contact us through the Service.
          </p>
        </section>
      </div>
    </div>
  );
}

export default CookiePolicy;




