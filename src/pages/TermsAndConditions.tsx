import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const TermsAndConditions = () => {
  useEffect(() => {
    document.title = "Terms & Conditions - SHOCASE";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">SHOCASE TERMS & CONDITIONS</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> Saturday, 11th October, 2025<br />
            <strong>Last Updated:</strong> Saturday, 11th October, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. INTRODUCTION & ACCEPTANCE</h2>
            <p className="text-muted-foreground mb-4">
              These Terms & Conditions ("Terms") govern your use of Shocase ("Platform," "Service," "we," "us," or "our"), operated by Shocase, located at 433 Graham Ave, Brooklyn, NY, 11211. By creating an account, accessing, or using Shocase, you ("User," "you," or "your") agree to these Terms.
            </p>
            <p className="text-muted-foreground mb-4">
              If you do not agree to these Terms, you must not use Shocase.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">1.1 Definitions</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li><strong>"Artist"</strong> – Musicians, bands, DJs, or performers creating EPKs on Shocase</li>
              <li><strong>"Venue"</strong> – Performance spaces, clubs, bars, or promoters listed in Shocase's venue database</li>
              <li><strong>"EPK"</strong> – Electronic Press Kit containing Artist profile, media, bio, and booking information</li>
              <li><strong>"User Content"</strong> – All materials uploaded by Users (photos, videos, text, links, etc.)</li>
              <li><strong>"AI-Generated Content"</strong> – Content created using Shocase's AI tools (bios, booking emails)</li>
              <li><strong>"Platform Services"</strong> – EPK builder, venue database, AI tools, application tracking, and related features</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">1.2 Eligibility</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>You must be 16 years or older to use Shocase</li>
              <li>If registering for a band or organization, you represent that you are authorized to bind that entity</li>
              <li>Users under 16 are NOT permitted to use Shocase under any circumstances</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">1.3 Account Security</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You are liable for all activities under your account</li>
              <li>Notify us immediately at shocase.artists@gmail.com if you suspect unauthorized access</li>
              <li>One person may manage multiple Artist profiles under a single account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. SCOPE OF SERVICE & DISCLAIMERS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Shocase is NOT a Talent Agency</h3>
            <p className="text-muted-foreground mb-4">
              <strong>CRITICAL DISCLAIMER:</strong> Shocase provides software tools to help Artists create EPKs, discover venues, and generate booking outreach emails. Shocase does NOT:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Act as your booking agent, manager, or representative</li>
              <li>Guarantee bookings, shows, or venue responses</li>
              <li>Negotiate contracts on your behalf</li>
              <li>Take commissions or percentages from bookings</li>
              <li>Create legally binding agreements between Artists and Venues</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              All communications between Artists and Venues occur independently. Shocase is a technology platform, not a talent agency or promoter.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">2.2 No Guarantee of Results</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Venue applications generated through Shocase do not guarantee responses or bookings</li>
              <li>AI-generated emails are suggestions; Users must review and customize content</li>
              <li>Venue contact information is provided for convenience; accuracy is not guaranteed</li>
              <li>Shocase is not responsible for Venue booking policies, responses, or business practices</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">2.3 Third-Party Venues</h3>
            <p className="text-muted-foreground mb-4">
              Venues listed on Shocase are independent businesses. We do not:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Verify Venue legitimacy or reputations</li>
              <li>Control Venue booking decisions</li>
              <li>Guarantee Venue contact information accuracy</li>
              <li>Mediate disputes between Artists and Venues</li>
            </ul>
            <p className="text-muted-foreground">
              Always conduct independent research before engaging with Venues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. USER CONTENT & INTELLECTUAL PROPERTY</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Ownership of Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain full ownership of all User Content you upload (photos, videos, bios, music links, etc.).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.2 License Grant to Shocase</h3>
            <p className="text-muted-foreground mb-4">
              By uploading User Content, you grant Shocase a non-exclusive, worldwide, royalty-free, sublicensable license to:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Display your EPK on Shocase and via your public URL (e.g., shocase.xyz/yourname)</li>
              <li>Use your content for Platform operations (storage, processing, distribution)</li>
              <li>Feature your EPK in marketing materials, newsletters, or promotional content</li>
              <li>Share your EPK with Venues when you submit applications</li>
              <li>Optimize media files for web/mobile display</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              This license ends when you delete content or terminate your account, except for:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Cached or archived copies</li>
              <li>Content shared with Venues before termination</li>
              <li>Aggregated/anonymized analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.3 Restrictions on User Content</h3>
            <p className="text-muted-foreground mb-4">You may NOT upload content that:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Infringes copyrights, trademarks, or other intellectual property</li>
              <li>Contains explicit sexual content, hate speech, or threats</li>
              <li>Promotes illegal activity</li>
              <li>Impersonates another person or entity</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Violates any third-party rights (publicity, privacy, etc.)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You represent and warrant that you have all necessary rights (including music rights, image rights, performance rights) to upload and share your content through Shocase.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.4 Copyright Compliance & DMCA</h3>
            <p className="text-muted-foreground mb-4">
              If you believe content on Shocase infringes your copyright, submit a DMCA takedown notice to shocase.artists@gmail.com with:
            </p>
            <ol className="text-muted-foreground list-decimal pl-6 mb-4">
              <li>Your contact information</li>
              <li>Description of copyrighted work</li>
              <li>Location of infringing content (URL)</li>
              <li>Statement of good faith belief</li>
              <li>Statement of accuracy under penalty of perjury</li>
              <li>Your physical or electronic signature</li>
            </ol>
            <p className="text-muted-foreground mb-4">
              <strong>Repeat Infringers:</strong> Accounts with 2+ valid DMCA complaints will be terminated.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">3.5 Platform Intellectual Property</h3>
            <p className="text-muted-foreground mb-4">
              Shocase owns all rights to the Platform's design, code, logos, trademarks ("SHOCASE"), and infrastructure. You may not:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Copy, modify, or reverse-engineer the Platform</li>
              <li>Use Shocase branding without written permission</li>
              <li>Scrape or harvest data from the Platform</li>
              <li>Create derivative works from Platform features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. AI-GENERATED CONTENT</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">4.1 AI Booking Emails</h3>
            <p className="text-muted-foreground mb-4">
              Shocase uses AI (powered by OpenAI) to generate personalized booking emails. You acknowledge:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>AI content is algorithmically generated and may contain errors</li>
              <li>You are solely responsible for reviewing, editing, and sending AI-generated emails</li>
              <li>Shocase is not liable for email content, tone, or outcomes</li>
              <li>AI emails are suggestions, not legal advice or guaranteed success formulas</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.2 AI Bio Enhancement</h3>
            <p className="text-muted-foreground mb-4">EPK bios can be enhanced using AI. You agree:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>To review AI-generated bios for accuracy before publishing</li>
              <li>That AI content may not perfectly capture your artistic voice</li>
              <li>Shocase is not liable for factual errors in AI-generated text</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">4.3 No Warranty on AI Outputs</h3>
            <p className="text-muted-foreground">
              AI-generated content is provided "AS IS" without warranties of accuracy, completeness, or suitability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. SUBSCRIPTION PLANS & PAYMENTS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Subscription Tiers</h3>
            <p className="text-muted-foreground mb-4">Shocase offers the following plans:</p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-muted-foreground border border-glass">
                <thead>
                  <tr className="border-b border-glass">
                    <th className="px-4 py-2 text-left">Tier</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Venue Applications</th>
                    <th className="px-4 py-2 text-left">Cooldown Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Free</td>
                    <td className="px-4 py-2">$0</td>
                    <td className="px-4 py-2">0 applications</td>
                    <td className="px-4 py-2">N/A</td>
                  </tr>
                  <tr className="border-b border-glass">
                    <td className="px-4 py-2">Pro</td>
                    <td className="px-4 py-2">$9.99/month</td>
                    <td className="px-4 py-2">10 per month</td>
                    <td className="px-4 py-2">60 days per venue</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Elite</td>
                    <td className="px-4 py-2">$29.99/month</td>
                    <td className="px-4 py-2">Unlimited</td>
                    <td className="px-4 py-2">30 days per venue</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-4">Prices are in USD and exclude applicable taxes.</p>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.2 Payment Terms</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Subscriptions are billed monthly in advance via Stripe</li>
              <li>You authorize recurring charges until cancellation</li>
              <li>Subscription fees are non-refundable (see Section 5.5)</li>
              <li>Failed payments may result in account suspension after 7 days</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.3 Application Limits & Cooldown Periods</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Pro users: 10 applications per calendar month; 60-day cooldown before re-applying to the same Venue</li>
              <li>Elite users: Unlimited applications; 30-day cooldown per Venue</li>
              <li>Limits reset on the 1st of each month</li>
              <li>Unused applications do NOT roll over</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.4 Upgrades & Downgrades</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Upgrades take effect immediately; you're charged the prorated difference</li>
              <li>Downgrades take effect at the next billing cycle</li>
              <li>Application limits apply immediately after downgrade</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.5 Cancellation & Refunds</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Cancel anytime via Account Settings or email shocase.artists@gmail.com</li>
              <li>Access continues until the end of your billing period</li>
              <li>No refunds for partial months or unused features</li>
              <li>Cancellation does NOT delete your EPK (see Section 11)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">5.6 Price Changes</h3>
            <p className="text-muted-foreground">
              We may change subscription prices with 30 days' notice via email. Continued use after notice constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. PRO COMPLIANCE & MUSIC LICENSING</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">6.1 Public Performance Rights</h3>
            <p className="text-muted-foreground mb-4">
              If your EPK includes embedded music (Spotify, SoundCloud, etc.) or videos with music:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>You are responsible for ensuring proper licenses (ASCAP, BMI, SESAC, etc.)</li>
              <li>Shocase does NOT provide performance licenses</li>
              <li>Embedding streaming links does NOT transfer licensing obligations to Shocase</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">6.2 Venue Licensing</h3>
            <p className="text-muted-foreground mb-4">Venues using Shocase to book performances must:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Hold appropriate PRO licenses for live music</li>
              <li>Comply with local copyright laws</li>
              <li>Ensure performances are properly licensed</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Shocase is NOT liable for unlicensed performances arranged through the Platform.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">6.3 Streaming Embeds</h3>
            <p className="text-muted-foreground mb-4">
              Embedded Spotify/Apple Music players are governed by those platforms' terms. Shocase is not responsible for:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Availability of embedded content</li>
              <li>Changes to third-party embed APIs</li>
              <li>Copyright violations in embedded content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. PROFILE ANALYTICS & VENUE RECOMMENDATIONS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Profile View Counter</h3>
            <p className="text-muted-foreground mb-4">
              Shocase tracks and displays the number of times your EPK has been viewed. You acknowledge:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Your EPK includes a public view counter showing total views in the last 30 days</li>
              <li>View counts are approximate and may not reflect unique viewers</li>
              <li>View tracking cannot be disabled (it's a core platform feature)</li>
              <li>Shocase uses view data to improve recommendations and platform features</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Privacy Note:</strong> We do NOT track individual viewer identities. Only an aggregate count is displayed.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">7.2 Venue Recommendations (Algorithmic)</h3>
            <p className="text-muted-foreground mb-4">
              Shocase may suggest venues based on your genre, location, past applications, and other factors. Important disclaimers:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Recommendations are algorithmic suggestions, not professional booking advice</li>
              <li>Shocase does NOT endorse, vet, or guarantee the quality of recommended venues</li>
              <li>Recommendations do NOT constitute an agency relationship or booking guarantee</li>
              <li>You are solely responsible for researching recommended venues before applying</li>
              <li>Shocase is not liable for poor matches, venue misconduct, or unsuccessful applications resulting from recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. PROHIBITED USES</h2>
            <p className="text-muted-foreground mb-4">You may NOT:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Use Shocase to spam Venues or send unsolicited bulk emails</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Upload copyrighted material without authorization</li>
              <li>Sell access to your account</li>
              <li>Use automated bots or scraping tools</li>
              <li>Circumvent subscription limits or cooldown periods</li>
              <li>Harass, threaten, or abuse other Users or Venues via venue applications</li>
              <li>Violate any local, state, or federal laws</li>
              <li>Manipulate profile view counts or analytics</li>
            </ul>
            <p className="text-muted-foreground">
              Violations may result in immediate account termination without refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">9. GMAIL API & THIRD-PARTY INTEGRATIONS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">9.1 Gmail Integration (Optional)</h3>
            <p className="text-muted-foreground mb-4">
              Shocase offers optional integration with Gmail via OAuth to help you compose and save booking email drafts. You acknowledge:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>We ONLY create and save drafts - Shocase does NOT send emails on your behalf or read your existing emails</li>
              <li>You must authorize Shocase to access your Gmail account via Google's OAuth consent screen</li>
              <li>You can revoke access at any time via your Google Account settings</li>
              <li>Gmail integration is optional; you can copy/paste emails manually instead</li>
              <li>Google's Privacy Policy applies to data shared through Gmail API</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">9.2 Revoking Gmail Access</h3>
            <p className="text-muted-foreground mb-4">To disconnect Gmail:</p>
            <ol className="text-muted-foreground list-decimal pl-6 mb-4">
              <li>Go to your Google Account → Security → Third-party apps</li>
              <li>Remove "Shocase" from authorized apps</li>
              <li>Or disconnect via Shocase Account Settings</li>
            </ol>
            <p className="text-muted-foreground">
              <strong>After revocation:</strong> Shocase can no longer create drafts, but your existing data on Shocase remains intact.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">10. DATA PRIVACY</h2>
            <p className="text-muted-foreground mb-4">
              Your use of Shocase is also governed by our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>. By using Shocase, you consent to:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Collection of profile data, usage analytics, and payment information</li>
              <li>Sharing EPK content with Venues when you submit applications</li>
              <li>Use of cookies and tracking technologies</li>
              <li>International data transfers (if applicable)</li>
              <li>Profile view count tracking</li>
              <li>Gmail OAuth access (if you enable Gmail integration)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">11. ACCOUNT TERMINATION</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">11.1 Termination by You</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Cancel your account anytime via Account Settings</li>
              <li>EPK content will be retained for 30 days for recovery</li>
              <li>After 30 days, all User Content is permanently deleted (except as required by law)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">11.2 Termination by Shocase</h3>
            <p className="text-muted-foreground mb-4">We may suspend or terminate your account immediately if you:</p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent activity</li>
              <li>Upload illegal or infringing content</li>
              <li>Fail to pay subscription fees (after 14-day grace period)</li>
              <li>Are a "repeat infringer" under DMCA</li>
              <li>Abuse the platform or harass other users</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">11.3 Effect of Termination</h3>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Subscription fees are non-refundable</li>
              <li>Public EPK URLs will be deactivated</li>
              <li>Venue application history may be retained for analytics (anonymized)</li>
              <li>You lose access to all Platform features</li>
              <li>Gmail integration (if enabled) is automatically disconnected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">12. LIABILITY LIMITATIONS & DISCLAIMERS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">12.1 "AS IS" Service</h3>
            <p className="text-muted-foreground mb-4">
              Shocase is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, including:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>No guarantee of uptime, availability, or error-free operation</li>
              <li>No warranty that AI tools will produce desired results</li>
              <li>No guarantee of Venue responses or bookings</li>
              <li>No warranty that venue recommendations will result in successful bookings</li>
              <li>No guarantee of profile view counter accuracy</li>
              <li>No warranty of Gmail API functionality or compatibility</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">12.2 Limitation of Liability</h3>
            <p className="text-muted-foreground mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              Shocase, its officers, directors, employees, and affiliates are NOT LIABLE for:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Lost profits, revenue, or business opportunities</li>
              <li>Loss of bookings or damaged professional relationships</li>
              <li>Errors in AI-generated content</li>
              <li>Venue misconduct or contract breaches</li>
              <li>Data loss due to technical failures</li>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Issues arising from venue recommendations</li>
              <li>Profile view counter inaccuracies</li>
              <li>Gmail API integration issues or Gmail account access problems</li>
              <li>Loss of drafts or data due to Gmail API disconnection</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>MAXIMUM LIABILITY:</strong> If we are found liable, damages are capped at the lesser of: (a) Fees paid by you in the last 12 months, or (b) $100 USD
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">12.3 Indemnification</h3>
            <p className="text-muted-foreground mb-4">
              You agree to indemnify and hold harmless Shocase from claims arising from:
            </p>
            <ul className="text-muted-foreground list-disc pl-6 mb-4">
              <li>Your User Content (copyright infringement, defamation, etc.)</li>
              <li>Your use of AI-generated emails</li>
              <li>Your interactions with Venues</li>
              <li>Your violation of these Terms or third-party rights</li>
              <li>Your misuse of profile analytics or recommendations</li>
              <li>Your use of Gmail integration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">13. DISPUTE RESOLUTION</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">13.1 Governing Law</h3>
            <p className="text-muted-foreground mb-4">
              These Terms are governed by the laws of New York State, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">13.2 Jurisdiction & Venue</h3>
            <p className="text-muted-foreground mb-4">
              Any disputes must be resolved in the state or federal courts of New York County, New York. You consent to personal jurisdiction there.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">13.3 Arbitration (Optional)</h3>
            <p className="text-muted-foreground mb-4">
              For disputes under $10,000, either party may elect binding arbitration under AAA rules. Arbitration is individual (no class actions).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">13.4 Class Action Waiver</h3>
            <p className="text-muted-foreground">
              You agree to resolve disputes individually. No class actions, class arbitrations, or representative actions are permitted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">14. CHANGES TO TERMS</h2>
            <p className="text-muted-foreground mb-4">
              We may update these Terms at any time. Changes will be posted with a new "Last Updated" date. Material changes will be emailed to your account email 30 days in advance.
            </p>
            <p className="text-muted-foreground">
              Continued use after changes constitutes acceptance. If you disagree, you must stop using Shocase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">15. MISCELLANEOUS</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">15.1 Entire Agreement</h3>
            <p className="text-muted-foreground mb-4">
              These Terms (plus Privacy Policy) constitute the entire agreement between you and Shocase.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">15.2 Severability</h3>
            <p className="text-muted-foreground mb-4">
              If any provision is found invalid, the rest of the Terms remain in effect.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">15.3 No Waiver</h3>
            <p className="text-muted-foreground mb-4">
              Our failure to enforce any right does not waive that right.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">15.4 Assignment</h3>
            <p className="text-muted-foreground mb-4">
              You may not transfer your account. We may assign these Terms to a successor entity.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">15.5 Force Majeure</h3>
            <p className="text-muted-foreground">
              We're not liable for failures due to events beyond our control (natural disasters, pandemics, internet outages, etc.).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">16. CONTACT INFORMATION</h2>
            <p className="text-muted-foreground mb-4">
              For questions, complaints, or DMCA notices:
            </p>
            <p className="text-muted-foreground">
              <strong>Email:</strong> shocase.artists@gmail.com<br />
              <strong>Address:</strong> 433 Graham Ave, Brooklyn, NY, 11211
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-glass">
            <p className="text-muted-foreground">
              By using Shocase, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
