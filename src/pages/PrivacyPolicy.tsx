import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - SHOCASE";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">SHOCASE PRIVACY POLICY</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> Saturday, 11th October, 2025<br />
            <strong>Last Updated:</strong> Saturday, 11th October, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. INTRODUCTION</h2>
            <p className="text-muted-foreground mb-4">
              Shocase ("we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our platform at shocase.xyz (the "Service").
            </p>
            <p className="text-muted-foreground mb-4">
              By using Shocase, you agree to this Privacy Policy. If you do not agree, please do not use the Service.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Age Requirement:</strong> Shocase is intended for users 16 years or older. We do NOT knowingly collect data from children under 16.
            </p>
            <p className="text-muted-foreground">
              For users in the European Union or California, additional rights are described in Sections 9 and 10.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. INFORMATION WE COLLECT</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Information You Provide Directly</h3>
            
            <h4 className="text-lg font-semibold text-foreground mb-2">Account Registration:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Artist/band name</li>
              <li>Profile photo</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">EPK Content:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Biography text</li>
              <li>Press photos (up to 7)</li>
              <li>Background images</li>
              <li>Video links (YouTube, Vimeo)</li>
              <li>Streaming platform links (Spotify, Apple Music, SoundCloud, Bandcamp)</li>
              <li>Tour dates (past and upcoming)</li>
              <li>Press quotes and media mentions</li>
              <li>Booking contact information (email, phone)</li>
              <li>Social media links (Instagram, Facebook, Twitter, TikTok)</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Payment Information:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Credit card details (processed by Stripe; we do NOT store full card numbers)</li>
              <li>Billing address</li>
              <li>Subscription tier and payment history</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Communications:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Support tickets and emails</li>
              <li>Survey responses</li>
              <li>Feedback submissions</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Gmail OAuth (Optional):</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>If you connect Gmail, we access only the permissions needed to create and save drafts</li>
              <li>We do NOT read your existing emails or send emails on your behalf</li>
              <li>Access token is stored securely and can be revoked anytime</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Automatically Collected Data</h3>
            
            <h4 className="text-lg font-semibold text-foreground mb-2">Usage Analytics:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device type (mobile, desktop, tablet)</li>
              <li>Pages visited and features used</li>
              <li>Time spent on pages</li>
              <li>Referral sources (how you found Shocase)</li>
              <li>Venue searches and filters applied</li>
              <li>Application submission events</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Cookies & Tracking Technologies:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Session cookies (to keep you logged in)</li>
              <li>Analytics cookies (processed internally via Supabase)</li>
              <li>Preference cookies (theme, language settings)</li>
              <li>Performance cookies (to optimize site speed)</li>
            </ul>
            <p className="text-muted-foreground mb-4">See Section 11 for cookie management options.</p>

            <h4 className="text-lg font-semibold text-foreground mb-2">Application Tracking:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Venues you applied to</li>
              <li>Application dates and timestamps</li>
              <li>Email content generated (stored for your records)</li>
              <li>Application outcomes (booked, pending, passed)</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Profile View Counter:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Total number of EPK views in the last 30 days</li>
              <li>Timestamps of views (for calculating 30-day rolling count)</li>
              <li>Note: We do NOT track individual viewer identities</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.3 Data from Third-Party Integrations</h3>
            
            <h4 className="text-lg font-semibold text-foreground mb-2">Spotify:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Artist profile data (if you link your Spotify account)</li>
              <li>Track streaming statistics (for display on your EPK)</li>
              <li>Playlist embeds</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Instagram:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Profile photo and bio (if you connect your Instagram)</li>
              <li>Recent posts (for display purposes)</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Stripe (Payment Processor):</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Payment confirmation data (when payment integration launches)</li>
              <li>Subscription status</li>
              <li>Failed payment notifications</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">Gmail API (Optional):</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>OAuth access token (to create drafts)</li>
              <li>No access to email content, inbox, or sent mail</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mb-2">We do NOT collect:</h4>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Spotify listening history</li>
              <li>Instagram DMs or private data</li>
              <li>Gmail email content or messages</li>
              <li>Credit card CVV codes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. HOW WE USE YOUR INFORMATION</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Core Platform Operations</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Account Management:</strong> Create and maintain your account</li>
              <li><strong>EPK Hosting:</strong> Display your profile on Shocase and via your public URL (e.g., shocase.xyz/yourname)</li>
              <li><strong>Venue Database:</strong> Provide searchable venue listings and filters</li>
              <li><strong>AI Content Generation:</strong> Create personalized booking emails and bio enhancements using your EPK data</li>
              <li><strong>Application Tracking:</strong> Record venue applications and booking outcomes</li>
              <li><strong>Subscription Management:</strong> Process payments, enforce usage limits, track application quotas</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.2 Communication</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Transactional Emails:</strong> Account confirmations, password resets, payment receipts (via Supabase Auth)</li>
              <li><strong>Platform Updates:</strong> New features, policy changes, service announcements</li>
              <li><strong>Marketing Emails:</strong> Tips, success stories, promotional offers (you can opt out)</li>
              <li><strong>Customer Support:</strong> Respond to your inquiries and troubleshoot issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.3 Analytics & Improvement</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Product Development:</strong> Understand how users interact with features to improve Shocase</li>
              <li><strong>Performance Optimization:</strong> Identify bugs, slow pages, and technical issues</li>
              <li><strong>A/B Testing:</strong> Experiment with design changes and feature rollouts</li>
              <li><strong>Aggregated Insights:</strong> Analyze trends (e.g., "most popular venue cities") without identifying individuals</li>
              <li><strong>Venue Recommendations:</strong> Generate personalized venue suggestions based on your genre, location, past applications, and application success rates</li>
              <li><strong>Profile View Counter:</strong> Display aggregate view count (last 30 days) to help you understand EPK traffic</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.4 Legal & Safety</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Fraud Prevention:</strong> Detect suspicious account activity or payment fraud</li>
              <li><strong>Copyright Enforcement:</strong> Process DMCA takedown requests</li>
              <li><strong>Compliance:</strong> Meet legal obligations (tax reporting, subpoenas, regulatory inquiries)</li>
              <li><strong>Terms Enforcement:</strong> Investigate violations of our Terms & Conditions</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.5 AI-Generated Content</h3>
            <p className="text-muted-foreground">
              Your EPK data (bio, genre, past shows) is sent to OpenAI's API to generate:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Personalized booking emails tailored to specific venues</li>
              <li>Enhanced artist bios in various tones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. HOW WE SHARE YOUR INFORMATION</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Public Display</h3>
            <p className="text-muted-foreground mb-4">
              If your EPK is published (via Account Settings), the following information is publicly accessible at your custom URL (e.g., shocase.xyz/yourname):
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Artist name</li>
              <li>Bio</li>
              <li>Photos and videos</li>
              <li>Streaming links</li>
              <li>Tour dates</li>
              <li>Press quotes</li>
              <li>Social media links</li>
              <li>Booking contact information (if you choose to display it)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You control visibility by toggling "Publish EPK" in your dashboard.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.2 Sharing with Venues</h3>
            <p className="text-muted-foreground mb-4">When you submit a venue application:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>The Venue receives your EPK URL and any additional information you include in the AI-generated email</li>
              <li>Venues do NOT automatically receive your email address unless you include it in the email</li>
              <li>Application tracking data (dates, outcomes) is stored on Shocase but NOT shared with other artists</li>
            </ul>
            <p className="text-muted-foreground mb-4"><strong>Profile Views:</strong></p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>We do NOT share individual viewer identities with anyone</li>
              <li>Only an aggregate view count (last 30 days) is displayed on your EPK</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.3 Service Providers</h3>
            <p className="text-muted-foreground mb-4">
              We share data with trusted third parties who help operate Shocase:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-muted-foreground border border-glass">
                <thead>
                  <tr className="border-b border-glass">
                    <th className="px-4 py-2 text-left">Provider</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                    <th className="px-4 py-2 text-left">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Supabase</td>
                    <td className="px-4 py-2">Database, media hosting, authentication</td>
                    <td className="px-4 py-2">All account data, EPK content, uploaded media, authentication emails</td>
                  </tr>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Stripe</td>
                    <td className="px-4 py-2">Payment processing (future)</td>
                    <td className="px-4 py-2">Email, billing address, payment method</td>
                  </tr>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">OpenAI</td>
                    <td className="px-4 py-2">AI content generation</td>
                    <td className="px-4 py-2">EPK data sent to OpenAI API for email/bio generation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Google (Gmail API)</td>
                    <td className="px-4 py-2">Draft email composition (optional)</td>
                    <td className="px-4 py-2">OAuth token only - no email content accessed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-4">
              These providers are bound by confidentiality agreements and may only use your data to provide services to Shocase.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Note:</strong> We do NOT currently use third-party analytics tools. All analytics are processed internally via Supabase.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.4 Legal Disclosures</h3>
            <p className="text-muted-foreground mb-4">We may disclose your information if required to:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Comply with legal obligations (subpoenas, court orders)</li>
              <li>Protect Shocase's rights or property</li>
              <li>Investigate fraud or security threats</li>
              <li>Prevent harm to users or the public</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.5 Business Transfers</h3>
            <p className="text-muted-foreground mb-4">
              If Shocase is acquired, merged, or sold, your data may be transferred to the new entity. You'll be notified via email.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.6 Aggregated / Anonymized Data</h3>
            <p className="text-muted-foreground mb-4">
              We may share non-identifiable data publicly or with partners:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>"10,000 artists created EPKs this year"</li>
              <li>"Top 5 cities for venue applications"</li>
              <li>Industry trend reports</li>
            </ul>
            <p className="text-muted-foreground">This data cannot be traced back to you.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. DATA RETENTION</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Active Accounts</h3>
            <p className="text-muted-foreground mb-4">
              We retain your data as long as your account is active or as needed to provide services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.2 Deleted Accounts</h3>
            <p className="text-muted-foreground mb-4">When you delete your account:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>EPK content is retained for 30 days for recovery (in case of accidental deletion)</li>
              <li>After 30 days, all User Content is permanently deleted</li>
              <li>Exception: Anonymized analytics data may be retained indefinitely</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.3 Legal Retention</h3>
            <p className="text-muted-foreground mb-4">
              Some data may be retained longer if required by law:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Payment records (for tax compliance): 7 years</li>
              <li>DMCA takedown notices: 3 years</li>
              <li>Security logs: 1 year</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.4 Application History</h3>
            <p className="text-muted-foreground mb-4">
              Venue application records are retained for 2 years to provide historical tracking. After 2 years, they're anonymized or deleted.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.5 Gmail OAuth Tokens</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>OAuth tokens are stored securely while Gmail integration is active</li>
              <li>Tokens are immediately deleted when you revoke access</li>
              <li>We do NOT retain any email content or drafts after disconnection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. DATA SECURITY</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">6.1 Security Measures</h3>
            <p className="text-muted-foreground mb-4">We implement industry-standard protections:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Encryption in transit:</strong> All data transmitted via HTTPS/TLS</li>
              <li><strong>Encryption at rest:</strong> Database encryption via Supabase</li>
              <li><strong>Access controls:</strong> Role-based permissions for Shocase staff</li>
              <li><strong>Password hashing:</strong> Passwords are bcrypt-hashed (never stored in plain text)</li>
              <li><strong>Regular backups:</strong> Daily automated backups</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">6.2 Your Responsibilities</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication (if available)</li>
              <li>Do NOT share your login credentials</li>
              <li>Log out on shared devices</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">6.3 No Guarantee</h3>
            <p className="text-muted-foreground mb-4">
              No system is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Use Shocase at your own risk.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">6.4 Data Breaches</h3>
            <p className="text-muted-foreground mb-4">If a breach occurs, we will:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Notify affected users within 72 hours (if legally required)</li>
              <li>Report to relevant authorities (e.g., data protection agencies)</li>
              <li>Provide guidance on protective measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. YOUR RIGHTS & CHOICES</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Access Your Data</h3>
            <p className="text-muted-foreground mb-4">
              You can view and download your EPK data anytime via your Dashboard.
            </p>
            <p className="text-muted-foreground mb-4">
              For a complete data export, email shocase.artists@gmail.com with your request. We'll provide a machine-readable file (JSON or CSV) within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.2 Correct or Update Data</h3>
            <p className="text-muted-foreground mb-4">
              Edit your EPK content, account settings, and profile information directly in your Dashboard.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.3 Delete Your Account</h3>
            <p className="text-muted-foreground mb-4">To permanently delete your account:</p>
            <ol className="text-muted-foreground list-decimal pl-6 mb-4">
              <li>Go to Account Settings → "Delete Account"</li>
              <li>Confirm deletion (this is irreversible)</li>
              <li>EPK content is deleted after 30 days</li>
            </ol>
            <p className="text-muted-foreground mb-4">
              Alternatively, email shocase.artists@gmail.com to request account deletion.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.4 Opt Out of Marketing Emails</h3>
            <p className="text-muted-foreground mb-4">
              Click "Unsubscribe" in any marketing email, or update preferences in Account Settings.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Note:</strong> You'll still receive transactional emails (payment receipts, password resets, etc.).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.5 Withdraw Consent</h3>
            <p className="text-muted-foreground mb-4">
              If you consented to data processing (e.g., marketing emails), you can withdraw consent anytime. This does NOT affect data processing based on other legal grounds (e.g., contract performance).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.6 Object to Processing</h3>
            <p className="text-muted-foreground mb-4">You may object to data processing for:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Direct marketing (see Section 7.4)</li>
              <li>Analytics (disable cookies; see Section 11)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.7 Data Portability</h3>
            <p className="text-muted-foreground mb-4">
              Request a machine-readable copy of your data to transfer to another service. Email shocase.artists@gmail.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. INTERNATIONAL DATA TRANSFERS</h2>
            <p className="text-muted-foreground mb-4">
              Shocase is based in the United States. If you access Shocase from outside the US, your data may be transferred to and processed in the US.
            </p>
            <p className="text-muted-foreground mb-4">We use safeguards for international transfers:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Standard Contractual Clauses (SCCs) with EU-based users</li>
              <li>Adequacy decisions where applicable</li>
              <li>Privacy Shield principles (if applicable)</li>
            </ul>
            <p className="text-muted-foreground">
              By using Shocase, you consent to international data transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">9. GDPR RIGHTS (EU Users)</h2>
            <p className="text-muted-foreground mb-4">
              If you're in the European Economic Area (EEA), UK, or Switzerland, you have additional rights under GDPR:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">9.1 Legal Basis for Processing</h3>
            <p className="text-muted-foreground mb-4">We process your data based on:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Contract performance:</strong> To provide Shocase services (Art. 6(1)(b) GDPR)</li>
              <li><strong>Legitimate interests:</strong> Analytics, fraud prevention, product improvement (Art. 6(1)(f) GDPR)</li>
              <li><strong>Consent:</strong> Marketing emails, optional features (Art. 6(1)(a) GDPR)</li>
              <li><strong>Legal obligations:</strong> Tax compliance, law enforcement (Art. 6(1)(c) GDPR)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">9.2 Your GDPR Rights</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Right to access (Art. 15)</li>
              <li>Right to rectification (Art. 16)</li>
              <li>Right to erasure ("right to be forgotten") (Art. 17)</li>
              <li>Right to restrict processing (Art. 18)</li>
              <li>Right to data portability (Art. 20)</li>
              <li>Right to object (Art. 21)</li>
              <li>Right to withdraw consent (Art. 7(3))</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, email shocase.artists@gmail.com.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">9.3 Complaints</h3>
            <p className="text-muted-foreground">
              If you believe we've violated GDPR, contact your national data protection authority.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">10. CCPA RIGHTS (California Users)</h2>
            <p className="text-muted-foreground mb-4">
              If you're a California resident, you have rights under the California Consumer Privacy Act (CCPA):
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">10.1 Right to Know</h3>
            <p className="text-muted-foreground mb-4">Request disclosure of:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Categories of personal information collected</li>
              <li>Sources of personal information</li>
              <li>Business purpose for collection</li>
              <li>Third parties with whom data is shared</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">10.2 Right to Delete</h3>
            <p className="text-muted-foreground mb-4">
              Request deletion of personal information we've collected (subject to exceptions).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">10.3 Right to Opt Out of Sale</h3>
            <p className="text-muted-foreground mb-4">
              Shocase does NOT sell your personal information. We may share data with service providers, but this is NOT a "sale" under CCPA.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">10.4 Non-Discrimination</h3>
            <p className="text-muted-foreground mb-4">
              We will NOT discriminate against you for exercising CCPA rights (e.g., denying service, charging different prices).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">10.5 How to Exercise Rights</h3>
            <p className="text-muted-foreground mb-4">Email shocase.artists@gmail.com with:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Your name and email</li>
              <li>Specific request (access, deletion, etc.)</li>
              <li>Proof of California residency (if applicable)</li>
            </ul>
            <p className="text-muted-foreground">We'll respond within 45 days.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">11. COOKIES & TRACKING TECHNOLOGIES</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">11.1 Types of Cookies</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-muted-foreground border border-glass">
                <thead>
                  <tr className="border-b border-glass">
                    <th className="px-4 py-2 text-left">Cookie Type</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Essential</td>
                    <td className="px-4 py-2">Account login, session management</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Analytics</td>
                    <td className="px-4 py-2">Track page views, clicks, usage patterns (via Supabase)</td>
                    <td className="px-4 py-2">Persistent (1 year)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Preferences</td>
                    <td className="px-4 py-2">Remember theme, language settings</td>
                    <td className="px-4 py-2">Persistent (1 year)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-3">11.2 Managing Cookies</h3>
            <p className="text-muted-foreground mb-4"><strong>Browser Settings:</strong></p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Chrome: Settings → Privacy → Cookies</li>
              <li>Firefox: Options → Privacy → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Cookies</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>Note:</strong> Disabling essential cookies may break core functionality (e.g., login).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">12. CHILDREN'S PRIVACY</h2>
            <p className="text-muted-foreground mb-4">
              Shocase is intended for users 16 years or older. We do NOT knowingly collect data from children under 16.
            </p>
            <p className="text-muted-foreground mb-4">If we discover a user is under 16, we will:</p>
            <ol className="text-muted-foreground list-decimal pl-6 mb-4">
              <li>Delete their account immediately</li>
              <li>Purge all associated data</li>
              <li>Notify the parent/guardian (if contact info is available)</li>
            </ol>
            <p className="text-muted-foreground mb-4">
              <strong>Parents:</strong> If your child under 16 created an account, contact shocase.artists@gmail.com immediately.
            </p>
            <p className="text-muted-foreground">
              <strong>COPPA Compliance:</strong> We comply with the Children's Online Privacy Protection Act (COPPA) and do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">13. DO NOT TRACK (DNT) SIGNALS</h2>
            <p className="text-muted-foreground mb-4">
              Some browsers have "Do Not Track" (DNT) settings. Shocase does NOT respond to DNT signals because there's no industry standard for implementation.
            </p>
            <p className="text-muted-foreground">
              To limit tracking, use browser extensions like Privacy Badger or uBlock Origin.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">14. CHANGES TO THIS PRIVACY POLICY</h2>
            <p className="text-muted-foreground mb-4">We may update this Privacy Policy to reflect:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>New features or services</li>
              <li>Legal or regulatory changes</li>
              <li>User feedback</li>
            </ul>
            <p className="text-muted-foreground mb-4"><strong>How We Notify You:</strong></p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>Minor changes:</strong> Updated "Last Updated" date (top of page)</li>
              <li><strong>Material changes:</strong> Email notification 30 days in advance</li>
            </ul>
            <p className="text-muted-foreground">
              Continued use after changes constitutes acceptance. If you disagree, delete your account before the effective date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">15. CONTACT US</h2>
            <p className="text-muted-foreground mb-4">
              For privacy questions, data requests, or complaints:
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Email:</strong> shocase.artists@gmail.com<br />
              <strong>Subject Line:</strong> "Privacy Inquiry"<br />
              <strong>Address:</strong> 433 Graham Ave, Brooklyn, NY, 11211
            </p>
            <p className="text-muted-foreground">
              <strong>Response Time:</strong> Within 30 days (or sooner for urgent requests)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">16. CALIFORNIA SHINE THE LIGHT LAW</h2>
            <p className="text-muted-foreground">
              California residents may request information about personal information shared with third parties for direct marketing purposes. Shocase does NOT share data for third-party marketing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">17. NEVADA PRIVACY RIGHTS</h2>
            <p className="text-muted-foreground">
              Nevada residents may opt out of the "sale" of personal information. Shocase does NOT sell personal information as defined by Nevada law.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-glass">
            <p className="text-muted-foreground mb-4">
              <strong>Last Updated:</strong> Saturday, 11th October, 2025
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Questions?</strong> Email shocase.artists@gmail.com
            </p>
            <p className="text-muted-foreground">
              By using Shocase, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
