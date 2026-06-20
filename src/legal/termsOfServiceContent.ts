export type LegalDocumentSection = {
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export const TERMS_OF_SERVICE_SECTIONS: readonly LegalDocumentSection[] = [
  {
    title: '1. Acceptance of Terms',
    paragraphs: [
      'These Terms of Service ("Terms") govern access to and use of websites, applications, and services operated by Zenformed LLC ("Zenformed," "we," "us," or "our"), including the Zenformed Platform, BuildCore, ForgeCore, FormCore, AnalyticsCore, and any future Zenformed products (collectively, the "Services").',
      'By creating an account, accessing, or using any Service, or by completing checkout for a subscription, you agree to these Terms. If you use the Services on behalf of an organization, you represent that you have authority to bind that organization, and "you" refers to that organization.',
      'If you do not agree to these Terms, do not use the Services.',
    ],
  },
  {
    title: '2. Accounts and Security',
    paragraphs: [
      'You must provide accurate account information and keep your credentials confidential. You are responsible for all activity under your account and for maintaining appropriate access controls within your organization.',
      'Notify us promptly at legal@zenformed.com if you suspect unauthorized access. Zenformed may suspend or require credential reset when we reasonably believe an account has been compromised.',
    ],
  },
  {
    title: '3. Subscription Billing',
    paragraphs: [
      'Paid Services are offered on subscription plans with recurring fees billed in advance according to the billing cycle you select (for example, monthly or annual). Prices, plan features, seat limits, and trial availability are described on our product pages and may vary by product.',
      'Unless stated otherwise at checkout, subscriptions renew automatically at the end of each billing period until canceled. You authorize Zenformed and our payment processor to charge applicable fees, taxes, and prorations to your designated payment method.',
    ],
  },
  {
    title: '4. Upgrades',
    paragraphs: [
      'When you upgrade to a higher-priced plan or billing cycle, changes may take effect immediately. Upgrades may be invoiced on a prorated basis for the remainder of the current billing period, as displayed during plan change preview or checkout.',
      'Feature access associated with the upgraded plan generally becomes available after the upgrade is processed successfully.',
    ],
  },
  {
    title: '5. Downgrades',
    paragraphs: [
      'When you downgrade to a lower-priced plan, the change may be scheduled to take effect at the end of your current billing period. Until then, you retain access to your current plan subject to these Terms.',
      'Downgrades may reduce available features, seat limits, storage, or other entitlements. You are responsible for adjusting usage before a downgrade takes effect.',
    ],
  },
  {
    title: '6. Cancellation',
    paragraphs: [
      'You may cancel a subscription to take effect at the end of the current billing period through your organization billing settings or by contacting support. Cancellation stops future renewals but does not entitle you to a refund for fees already paid except where required by law.',
      'If you cancel during a trial period, trial access may end immediately or at trial expiration depending on the product configuration shown at signup.',
    ],
  },
  {
    title: '7. Payment Processing Through Stripe',
    paragraphs: [
      'Zenformed uses Stripe, Inc. ("Stripe") as its third-party payment processor. By subscribing, you agree to Stripe\'s applicable terms and privacy practices for payment processing.',
      'Zenformed does not store full credit card numbers on its servers. Payment method details are collected and processed by Stripe. Failed payments may result in suspension of paid features after reasonable notice.',
    ],
  },
  {
    title: '8. Customer Responsibilities',
    paragraphs: [
      'You are responsible for your use of the Services, the accuracy of data you submit, compliance with applicable laws, and obtaining any consents required for data you upload or process through the Services.',
      'You must maintain adequate backups of business-critical data where appropriate. While Zenformed implements safeguards, you remain responsible for export and retention decisions for your organization.',
    ],
  },
  {
    title: '9. Ownership of Customer Data',
    paragraphs: [
      'As between you and Zenformed, you retain ownership of data, files, documents, and content you or your users submit to the Services ("Customer Data").',
      'You grant Zenformed a limited license to host, process, transmit, and display Customer Data solely to provide, maintain, secure, and improve the Services and as otherwise described in our Privacy Policy.',
    ],
  },
  {
    title: '10. Acceptable Use',
    paragraphs: [
      'You may not use the Services to violate law, infringe intellectual property, distribute malware, attempt unauthorized access, interfere with Service operation, harass others, or upload unlawful or harmful content.',
      'You may not reverse engineer, scrape, or resell the Services except as expressly permitted in writing by Zenformed. We may investigate and suspend or terminate access for material violations.',
    ],
  },
  {
    title: '11. Service Availability',
    paragraphs: [
      'Zenformed strives to provide reliable Services but does not guarantee uninterrupted or error-free operation. Maintenance, updates, and events outside our reasonable control may cause temporary unavailability.',
      'Service interruptions may occur due to failures or performance issues with third-party providers and infrastructure, including without limitation Stripe, Supabase, Railway, Vercel, Resend, internet service providers, cloud hosting networks, and other third-party infrastructure on which the Services depend.',
      'Zenformed is not liable for outages, delays, or data transmission failures caused by third-party providers or general internet conditions.',
    ],
  },
  {
    title: '12. Third-Party Providers',
    paragraphs: [
      'The Services integrate with third-party products and infrastructure. Your use of those providers may be subject to separate terms. Zenformed is not responsible for third-party services except to the extent required by applicable law.',
      'References to third-party names are for identification only and do not imply endorsement.',
    ],
  },
  {
    title: '13. Maintenance and Updates',
    paragraphs: [
      'Zenformed may deploy updates, patches, and new features that change Service behavior or appearance. We may modify or discontinue features with reasonable notice when practicable.',
      'Scheduled maintenance may temporarily limit access. We will attempt to minimize disruption to production Services.',
    ],
  },
  {
    title: '14. Intellectual Property',
    paragraphs: [
      'Zenformed and its licensors own the Services, software, branding, documentation, and all related intellectual property except Customer Data.',
      'Subject to these Terms and your subscription entitlements, Zenformed grants you a limited, non-exclusive, non-transferable license to access and use the Services for your internal business purposes during an active subscription or trial.',
    ],
  },
  {
    title: '15. Suspension and Termination',
    paragraphs: [
      'Zenformed may suspend or terminate access for non-payment, breach of these Terms, security risk, or legal requirement. You may stop using the Services at any time.',
      'Upon termination, your right to access the Services ends. Provisions that by nature should survive (including payment obligations accrued, ownership, disclaimers, limitations of liability, and indemnification) will survive termination.',
    ],
  },
  {
    title: '16. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, Zenformed and its officers, directors, employees, and suppliers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenue, data, goodwill, or business interruption, arising from or related to the Services or these Terms.',
      'To the maximum extent permitted by law, Zenformed\'s total aggregate liability for all claims arising out of or relating to the Services or these Terms in any twelve-month period will not exceed the greater of (a) the amounts you paid to Zenformed for the Service giving rise to the claim during that period, or (b) one hundred U.S. dollars (US $100).',
      'Some jurisdictions do not allow certain limitations; in those jurisdictions, liability is limited to the fullest extent permitted by law.',
    ],
  },
  {
    title: '17. No Warranty / As-Is Service',
    paragraphs: [
      'The Services are provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.',
      'Zenformed does not warrant that the Services will meet your requirements, operate without interruption, or be free of errors or harmful components.',
    ],
  },
  {
    title: '18. Indemnification',
    paragraphs: [
      'You will defend, indemnify, and hold harmless Zenformed and its affiliates, officers, directors, employees, and agents from claims, damages, liabilities, and expenses (including reasonable attorneys\' fees) arising from your Customer Data, your use of the Services, or your violation of these Terms or applicable law.',
    ],
  },
  {
    title: '19. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of the State of Tennessee, United States, without regard to conflict-of-law principles.',
      'Except where prohibited, the exclusive venue for disputes arising from these Terms or the Services will be state or federal courts located in Tennessee, and you consent to personal jurisdiction in those courts.',
    ],
  },
  {
    title: '20. Changes to Terms',
    paragraphs: [
      'Zenformed may update these Terms from time to time. When we make material changes, we will update the effective date and version shown on this page and may provide additional notice where appropriate.',
      'Continued use of the Services after updated Terms take effect constitutes acceptance. If you do not agree to updated Terms, you must stop using the Services and cancel applicable subscriptions.',
    ],
  },
  {
    title: '21. Contact Information',
    paragraphs: [
      'Questions about these Terms may be sent to legal@zenformed.com.',
      'Zenformed LLC, Murfreesboro, Tennessee, USA.',
    ],
  },
];
