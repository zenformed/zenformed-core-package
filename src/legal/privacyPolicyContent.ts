import type { LegalDocumentSection } from './termsOfServiceContent';

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
    title: '3. Billing Information',
    paragraphs: [
      'When you purchase a subscription, we collect billing contact details and subscription selections (product, plan, billing cycle, and trial status). Payment card information is collected and processed by Stripe.',
      'Zenformed does not store full credit card numbers on our servers. We may receive limited billing metadata from Stripe, such as customer identifiers, payment status, invoice references, and the last four digits of a card where provided by Stripe.',
    ],
  },
  {
    title: '4. Uploaded Files and Documents',
    paragraphs: [
      'Depending on the product you use, you or your users may upload files, photos, documents, form submissions, project records, and other content ("Customer Content").',
      'Customer Content is stored to provide the Services you request. As between you and Zenformed, you retain ownership of Customer Content subject to the license described in our Terms of Service.',
    ],
  },
  {
    title: '5. Usage Data',
    paragraphs: [
      'We collect information about how the Services are accessed and used, such as feature interactions, timestamps, session activity, device and browser type, IP address, and diagnostic events needed to operate and secure the platform.',
    ],
  },
  {
    title: '6. Analytics and Logs',
    paragraphs: [
      'We maintain application, security, and infrastructure logs to monitor performance, detect abuse, troubleshoot errors, and improve reliability.',
      'Aggregated or de-identified analytics may be used to understand product usage trends without identifying individual users where practicable.',
    ],
  },
  {
    title: '7. How We Use Information',
    paragraphs: [
      'We use collected information to provide and maintain the Services, process subscriptions, authenticate users, enforce terms, communicate about accounts and billing, provide customer support, improve products, and comply with legal obligations.',
      'We may send service-related messages about security, billing, or material changes to policies or features. Marketing communications, where permitted, will follow applicable consent requirements.',
    ],
  },
  {
    title: '8. Data Sharing',
    paragraphs: [
      'We do not sell personal information. We share information with service providers that help us operate the Services, when required by law, to protect rights and safety, in connection with a business transaction subject to appropriate safeguards, or with your direction.',
      'Organization administrators may access information about members and activity within their organization according to product permissions.',
    ],
  },
  {
    title: '9. Third-Party Service Providers',
    paragraphs: [
      'Zenformed relies on trusted third-party providers to deliver the Services, including without limitation:',
      'Stripe for payment processing; Supabase for authentication, database, and storage services; Railway and Vercel for application hosting and delivery; and Resend for transactional email delivery.',
      'These providers process information on our behalf according to their terms and our instructions. Their availability and performance may affect Service operation.',
    ],
  },
  {
    title: '10. Data Security',
    paragraphs: [
      'We implement administrative, technical, and organizational measures designed to protect information, including access controls, encryption in transit, and monitoring. No method of transmission or storage is completely secure.',
      'You are responsible for safeguarding account credentials and configuring appropriate permissions within your organization.',
    ],
  },
  {
    title: '11. Data Retention',
    paragraphs: [
      'We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, and enforce agreements. Retention periods may vary by data type and product.',
      'Backup and deleted-data recovery windows may apply for operational continuity and disaster recovery.',
    ],
  },
  {
    title: '12. Customer Rights',
    paragraphs: [
      'Depending on your location, you may have rights to access, correct, delete, or restrict certain processing of personal information, or to object to certain uses.',
      'To exercise applicable rights, contact privacy@zenformed.com. We may need to verify your identity and organization affiliation before responding.',
    ],
  },
  {
    title: '13. Data Export Requests',
    paragraphs: [
      'Organization administrators may request export of Customer Content available through product features or by contacting privacy@zenformed.com.',
      'We will respond to reasonable export requests in accordance with applicable law and technical capabilities of the relevant Service.',
    ],
  },
  {
    title: '14. Account Deletion Requests',
    paragraphs: [
      'You may request deletion of your user account or organization data subject to legal retention requirements, active billing obligations, and backup cycles.',
      'Deletion requests should be sent to privacy@zenformed.com. Some information may persist in logs or backups for a limited period before being overwritten.',
    ],
  },
  {
    title: '15. Children\'s Privacy',
    paragraphs: [
      'The Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information, contact privacy@zenformed.com.',
    ],
  },
  {
    title: '16. International Users',
    paragraphs: [
      'Zenformed is based in the United States. If you access the Services from outside the United States, your information may be processed in the United States and other locations where our providers operate.',
      'By using the Services, you consent to transfer and processing in jurisdictions that may have different data protection laws than your own, subject to applicable legal requirements.',
    ],
  },
  {
    title: '17. Changes to Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we make material changes, we will update the effective date and version on this page and may provide additional notice where appropriate.',
      'Continued use of the Services after an update becomes effective constitutes acceptance of the revised Privacy Policy.',
    ],
  },
  {
    title: '18. Contact Information',
    paragraphs: [
      'Privacy questions and requests may be sent to privacy@zenformed.com.',
      'Zenformed LLC, Murfreesboro, Tennessee, USA.',
    ],
  },
];
