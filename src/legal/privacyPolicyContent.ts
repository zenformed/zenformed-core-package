import { DEFAULT_LEGAL_TERMS_PATH } from './constants';
import type { LegalDocumentSection } from './legalDocumentTypes';

export const PRIVACY_POLICY_SECTIONS: readonly LegalDocumentSection[] = [
  {
    title: '1. Information We Collect',
    paragraphs: [
      'This Privacy Policy describes how Zenformed LLC ("Zenformed," "we," "us," or "our") collects, uses, and shares information when you use the Zenformed Platform, BuildCore, ForgeCore, FormCore, AnalyticsCore, and related services (collectively, the "Services").',
      'We collect information you provide directly, information generated through your use of the Services, and limited information from third-party integrations necessary to operate the Services.',
    ],
  },
  {
    title: '2. Account Information',
    paragraphs: [
      'When you register or are invited to an organization, we collect information such as your name, email address, organization affiliation, role, authentication identifiers, and profile preferences.',
      'We use account information to authenticate users, manage organization membership, provide support, and secure access to the Services.',
    ],
  },
  {
    title: '3. Google Sign-In',
    paragraphs: [
      'If you choose to sign in using your Google Account, Zenformed receives basic profile information provided by Google, which may include your name, email address, profile photo URL, and a unique Google account identifier.',
      'Zenformed uses this information to authenticate your account, associate your Google identity with your Zenformed account, maintain account security, and provide access to the Services. Profile photo information that may be received from Google is not required for sign-in; Zenformed currently uses Google-provided name and email information to establish and secure your account and does not rely on storing Google profile photos as part of the standard Google Sign-In flow.',
      'Zenformed does not request access to Gmail, Google Drive, Google Calendar, Google Contacts, or other Google services unless you separately authorize additional permissions for a future feature.',
    ],
  },
  {
    title: '4. Billing Information',
    paragraphs: [
      'When you purchase a subscription, we collect billing contact details and subscription selections (product, plan, billing cycle, and trial status). Payment card information is collected and processed by Stripe.',
      'Zenformed does not store full credit card numbers on our servers. We may receive limited billing metadata from Stripe, such as customer identifiers, payment status, invoice references, and the last four digits of a card where provided by Stripe.',
    ],
  },
  {
    title: '5. Uploaded Files and Documents',
    paragraphs: [
      'Depending on the product you use, you or your users may upload files, photos, documents, form submissions, project records, and other content ("Customer Content").',
      [
        'Customer Content is stored to provide the Services you request. As between you and Zenformed, you retain ownership of Customer Content subject to the license described in our ',
        {
          type: 'link',
          href: DEFAULT_LEGAL_TERMS_PATH,
          label: 'Terms of Service',
        },
        '.',
      ],
    ],
  },
  {
    title: '6. Usage Data',
    paragraphs: [
      'We collect information about how the Services are accessed and used, such as feature interactions, timestamps, session activity, device and browser type, IP address, and diagnostic events needed to operate and secure the platform.',
    ],
  },
  {
    title: '7. Analytics and Logs',
    paragraphs: [
      'We maintain application, security, and infrastructure logs to monitor performance, detect abuse, troubleshoot errors, and improve reliability.',
      'Aggregated or de-identified analytics may be used to understand product usage trends without identifying individual users where practicable.',
    ],
  },
  {
    title: '8. Cookies and Authentication Technologies',
    paragraphs: [
      'Zenformed uses browser local storage, session storage, and similar technologies to maintain secure authentication sessions, preserve limited login and redirect context during sign-in flows (including Google Sign-In), remember preferences, and protect accounts from unauthorized access. Cookies may be used by Zenformed or its authentication providers where required to operate sign-in securely.',
      'These technologies are used to operate and secure the Services. Zenformed does not sell personal information or use authentication storage to track users across unrelated websites.',
    ],
  },
  {
    title: '9. How We Use Information',
    paragraphs: [
      'We use collected information to provide and maintain the Services, process subscriptions, authenticate users, enforce terms, communicate about accounts and billing, provide customer support, improve products, and comply with legal obligations.',
      'We may send service-related messages about security, billing, or material changes to policies or features. Marketing communications, where permitted, will follow applicable consent requirements.',
    ],
  },
  {
    title: '10. Legal Bases for Processing',
    paragraphs: [
      'Where required by applicable law, Zenformed processes personal information:',
    ],
    bullets: [
      'to perform a contract with you or your organization;',
      'with your consent;',
      'to comply with legal obligations;',
      'to protect the security, integrity, and availability of the Services; and',
      'based on legitimate interests in operating, supporting, and improving the Services, where those interests are not overridden by applicable privacy rights.',
    ],
  },
  {
    title: '11. Data Sharing',
    paragraphs: [
      'We do not sell personal information. We share information with service providers that help us operate the Services, when required by law, to protect rights and safety, in connection with a business transaction subject to appropriate safeguards, or with your direction.',
      'Organization administrators may access information about members and activity within their organization according to product permissions.',
    ],
  },
  {
    title: '12. Third-Party Service Providers',
    paragraphs: [
      'Zenformed relies on trusted third-party providers to deliver the Services, including without limitation:',
      'Stripe for payment processing; Supabase for authentication, database, and storage services; Railway and Vercel for application hosting and delivery; and Resend for transactional email delivery.',
      'When you use Google Sign-In, Google acts as an identity provider and provides limited account profile information to Zenformed for authentication as described in the Google Sign-In section. That disclosure does not mean Google receives all Zenformed Customer Content or other account data beyond what is necessary for the Google Sign-In process you initiate.',
      'These providers process information on our behalf or, for identity providers such as Google during Sign-In, according to their terms and the permissions you grant. Their availability and performance may affect Service operation.',
    ],
  },
  {
    title: '13. AI Features',
    paragraphs: [
      'Certain Zenformed products may include artificial-intelligence-assisted features.',
      'When a user invokes an AI feature, Zenformed and its service providers process only the information reasonably necessary to provide the requested feature, maintain security, and troubleshoot errors.',
      'Zenformed does not use Customer Content to train public or third-party general-purpose AI models unless the customer has expressly agreed to that use.',
    ],
  },
  {
    title: '14. Data Security',
    paragraphs: [
      'We implement administrative, technical, and organizational measures designed to protect information, including access controls, encryption in transit, and monitoring. No method of transmission or storage is completely secure.',
      'You are responsible for safeguarding account credentials and configuring appropriate permissions within your organization.',
    ],
  },
  {
    title: '15. Data Retention',
    paragraphs: [
      'We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, and enforce agreements. Retention periods may vary by data type and product.',
      'Backup and deleted-data recovery windows may apply for operational continuity and disaster recovery.',
    ],
  },
  {
    title: '16. Customer Rights',
    paragraphs: [
      'Depending on your location and applicable law, including laws such as the GDPR, UK GDPR, CCPA/CPRA, and similar privacy laws, you may have rights to access, correct, delete, export, or restrict certain processing of personal information, or to object to certain uses.',
      'To exercise applicable rights, contact privacy@zenformed.com. Zenformed may need to verify your identity, authority, and organization affiliation before responding.',
    ],
  },
  {
    title: '17. Data Export Requests',
    paragraphs: [
      'Organization administrators may request export of Customer Content available through product features or by contacting privacy@zenformed.com.',
      'We will respond to reasonable export requests in accordance with applicable law and technical capabilities of the relevant Service.',
    ],
  },
  {
    title: '18. Account Deletion Requests',
    paragraphs: [
      'You may request deletion of your user account or organization data subject to legal retention requirements, active billing obligations, and backup cycles.',
      'Deletion requests should be sent to privacy@zenformed.com. Some information may persist in logs or backups for a limited period before being overwritten.',
    ],
  },
  {
    title: "19. Children's Privacy",
    paragraphs: [
      'The Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information, contact privacy@zenformed.com.',
    ],
  },
  {
    title: '20. International Users',
    paragraphs: [
      'Zenformed is based in the United States. If you access the Services from outside the United States, your information may be processed in the United States and other locations where our providers operate.',
      'By using the Services, you consent to transfer and processing in jurisdictions that may have different data protection laws than your own, subject to applicable legal requirements.',
    ],
  },
  {
    title: '21. Changes to Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we make material changes, we will update the effective date and version on this page and may provide additional notice where appropriate.',
      'Continued use of the Services after an update becomes effective constitutes acceptance of the revised Privacy Policy.',
    ],
  },
  {
    title: '22. Contact Information',
    paragraphs: [
      'Privacy questions, privacy-rights requests, and account or data deletion requests may be sent to privacy@zenformed.com.',
      'Legal questions may be sent to legal@zenformed.com.',
      'Zenformed LLC, Murfreesboro, Tennessee, USA.',
    ],
  },
];
