import { ContractTemplate, BenchmarkTabItem, MythItem } from '../types';

export const LOGO_URL = "/logo.jpg";
export const ADVOCATE_ROOM_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuA6sblNKmc23VDTkH9UGzeokmPs2I718Kyfq2M8V6TYMgR6LGWLJHGN6A-mRyAhsrvWERx-slxc1rN1lT4RyQs7eOtPmh6G_v5e9rWp0qTF8RxE-fdGmIm7iBbED8uz20TdXaYunQtxCDLrr7iQFAdQIa-LLtZmheu4p8LoI_01AQR9ggtSPOhIQveLCxG18chnBf_hYDJIJTqbT8Txj3hDmZMYklx1bIasmMlPbXYNu7WHu1zEdJdxQA";
export const APARTMENT_KEYS_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDA4u99MqmeJSb0hlqMvdIYo1AZ_rxfmfGe6D4XsCPjJ5aWMUZQNI_Afoahlz7R0BoGJ6tBoqOzg6mFRSUpHqS3ha0lWH10x0EoDnoMUhHoF_wRtF_tm74BMFKsv_spnYXIxnDDFgbTX-_y_x_ndqj_MaTWiM3Z8wuTNkCZ8kTJtlNAnrq76PWXcAbxMaieYIrYnSkQYvJRki8YKohptp0P6NYbYd3HUjrNezzAqZL3i9Y3TF21u_vNSA";

// Standard reference agreement templates for comparison and auditing
export const SAMPLE_TEMPLATES: Record<string, ContractTemplate> = {
  rental: {
    id: 'rental',
    title: '11-Month Residential Rental Agreement',
    category: 'Residential Rental / Lease (India)',
    categoryKey: 'rental',
    fairnessScore: 58,
    totalClauses: 14,
    highConcern: 2,
    worthNoting: 3,
    standardFair: 9,
    primaryActionRequired: 'We recommend requesting modifications to Clause 4 (Arbitrary Entry) and Clause 9 (Double Deposit Forfeiture) before signing or transferring the advance token.',
    contractText: `AGREEMENT FOR LEASE (11 MONTHS)
BETWEEN: [Lessor / Landlord Name] (Lessor) AND [Lessee / Tenant Name] (Lessee)
PREMISES: [Flat / Property Number, Layout Name, City, Pincode]

CLAUSE 2: The monthly rent of ₹35,000 shall be paid on or before the 5th of each calendar month via NEFT/UPI.

CLAUSE 4: The Lessor or their authorized agents reserve full rights to inspect the scheduled premises at any hour of the day or night without prior intimation to the Lessee.

CLAUSE 9: In the event the Tenant vacates prior to the 11-month expiry, the entire security deposit of Rs. 1,50,000 shall stand unconditionally forfeited, alongside a mandatory 2-month painting and whitewashing charge deducted separately.

CLAUSE 12: All legal proceedings, arbitrations, and disputes arising out of this agreement shall be strictly instituted in the courts of [Distant City / Owner Hometown], irrespective of where the property is situated.`,
    clauses: [
      {
        id: 9,
        clauseNumber: 'Clause 9',
        title: 'Security Deposit Deductions & Lock-in Penalties',
        subject: 'Early Vacating Penalties & Mandatory Redecoration Fees',
        severity: 'high',
        severityLabel: '🚨 High Concern • Unfair Penalty',
        originalText: '“In the event the Tenant vacates prior to the 11-month expiry, the entire security deposit of Rs. 1,50,000 shall stand unconditionally forfeited, alongside a mandatory 2-month painting and whitewashing charge deducted separately.”',
        plainMeaning: 'If you need to leave the house early (even after giving a standard 1-month written notice), you would lose your entire deposit of ₹1.5 Lakhs. On top of that, an additional 2 months\' rent is claimed for painting. In Indian metro rental markets (Bengaluru, Mumbai, NCR), customary deductions permit at most 1 month rent for painting and standard 1-month mutual notice for exits.',
        statutoryContext: 'Under Section 74 of the Indian Contract Act, penalties without genuine pre-estimated damage are legally vulnerable.',
        statutoryLaw: 'Indian Contract Act • Sec 74',
        suggestedFix: 'Replace with standard 1-month mutual notice period with no deposit forfeiture, and cap painting charge to actual bills or 1 month rent maximum.',
        counterRequestCopy: 'Regarding Clause 9: Requesting standard 1-month notice period for exit without forfeiture of deposit, with painting deductions limited to maximum one month rent as per prevailing tenancy practices.'
      },
      {
        id: 4,
        clauseNumber: 'Clause 4',
        title: 'Landlord Inspection & Unannounced Entry',
        subject: 'Right of Entry & Privacy Boundaries',
        severity: 'high',
        severityLabel: '🚨 High Concern • Violation of Peaceful Possession',
        originalText: '“The Lessor or their authorized agents reserve full rights to inspect the scheduled premises at any hour of the day or night without prior intimation to the Lessee.”',
        plainMeaning: 'The landlord is claiming the authority to walk into the rented flat at any time—including late nights—without prior notice. In Indian tenancy jurisprudence, tenants possess an unambiguous right to quiet and undisturbed enjoyment.',
        statutoryContext: 'Chapter IV of the Model Tenancy Act dictates at least 24 hours written notice before entering rented premises, restricted between 07:00 and 20:00.',
        statutoryLaw: 'Model Tenancy Law • Chapter IV',
        suggestedFix: 'Amend to: “Subject to minimum 24 hours prior written notice via WhatsApp/Email, strictly during daytime hours (10 AM - 7 PM).”',
        counterRequestCopy: 'Regarding Clause 4: Please amend to: Lessor may inspect premises with at least 24 hours prior written notice, on mutually convenient daytime hours.'
      },
      {
        id: 12,
        clauseNumber: 'Clause 12',
        title: 'Jurisdiction & Dispute Resolution',
        subject: 'Court Locations & Arbitration Seat',
        severity: 'warning',
        severityLabel: '⚠️ Worth Noting • Unfavorable Court Location',
        originalText: '“All legal proceedings and disputes shall be strictly instituted in the courts of [Distant City / Owner Hometown].”',
        plainMeaning: 'The rented property is in the resident city, but the owner has inserted a distant jurisdiction as the legal court venue. If a dispute over deposit refund escalates to court or consumer forum, you would be forced to travel or hire an advocate in a distant city.',
        statutoryContext: 'Property disputes are most economically resolved where the property physically resides under Civil Procedure Code territorial jurisdiction principles.',
        statutoryLaw: 'Civil Procedure Code (Territorial Jurisdiction)',
        suggestedFix: 'Request changing court jurisdiction to the local courts where the property is located.',
        counterRequestCopy: 'Regarding Clause 12: As the property is located locally, standard practice requires jurisdictional venue to be designated as local courts. Kindly revise.'
      },
      {
        id: 2,
        clauseNumber: 'Clause 2',
        title: 'Monthly Rent & Due Date',
        subject: 'Payment Schedule & Modes',
        severity: 'fair',
        severityLabel: '✅ Standard & Fair',
        originalText: '“Rent of ₹35,000 shall be paid on or before the 5th of each calendar month via NEFT/UPI.”',
        plainMeaning: 'Clean, standard payment terms with a reasonable 5-day grace period for bank clearance. No hidden surcharge or unfair daily penalty noted.',
        statutoryContext: 'Standard commercial tenancy practice in Indian urban centres.',
        statutoryLaw: 'Standard Urban Practice'
      }
    ],
    emailSubject: 'Adjustments regarding draft rental agreement - [Property Address]',
    emailBody: `Dear [Landlord / Lessor Name],

Thank you for sharing the draft agreement for [Property Address]. I am looking forward to our tenancy. I have reviewed the clauses and just had two quick adjustments in line with standard rental practices before we print the e-stamp paper:

1. Clause 4 (Inspection): Could we please modify this to state 24 hours prior written notice during reasonable daytime hours (10 AM to 7 PM)? This ensures mutual privacy.
2. Clause 9 (Early Exit & Painting): In case of unforeseen job relocation, could we maintain a mutual 1-month notice period rather than complete forfeiture of the deposit? Additionally, standard painting deductions are typically capped at 1 month's rent.
3. Clause 12 (Jurisdiction): Requesting local city courts since the property and bank transactions are located here.

Looking forward to your confirmation so we can finalize the agreement smoothly.

Warm regards,
[Tenant / Lessee Name]`
  },
  job: {
    id: 'job',
    title: 'Employment & Non-Compete Agreement',
    category: 'Employment & Service Bond',
    categoryKey: 'employment',
    fairnessScore: 62,
    totalClauses: 12,
    highConcern: 2,
    worthNoting: 2,
    standardFair: 8,
    primaryActionRequired: 'Clause 7 contains an unlawful post-employment 24-month non-compete void under Sec 27 of the Indian Contract Act, and Clause 11 has a liquidated damages training bond.',
    contractText: `EMPLOYMENT & CONFIDENTIALITY AGREEMENT
COMPANY: [Company Name, e.g. Employer Technologies Pvt Ltd]
EMPLOYEE: [Employee Name] (Software Development Engineer II)

CLAUSE 3: Working hours shall be flexible, subject to project delivery deadlines.

CLAUSE 7: Non-Compete Restriction: The Employee explicitly covenants that for a period of 24 (twenty-four) calendar months following separation from the Company, they shall not accept employment, consult, or engage with any software organization operating in India.

CLAUSE 11: Training Bond: Employee agrees that early resignation prior to 18 months service requires repayment of ₹3,00,000 as liquidated damages for orientation.`,
    clauses: [
      {
        id: 7,
        clauseNumber: 'Clause 7',
        title: 'Post-Employment Pan-India Non-Compete',
        subject: 'Blanket Restraint on Livelihood',
        severity: 'high',
        severityLabel: '🚨 High Concern • Void Under Indian Law',
        originalText: '“The Employee explicitly covenants that for a period of 24 (twenty-four) calendar months following separation from the Company, they shall not accept employment, consult, or engage with any software organization operating in India.”',
        plainMeaning: 'They claim you cannot work for any tech firm across India for 2 years after leaving. This is practically an embargo on your professional existence.',
        statutoryContext: 'Under Section 27 of the Indian Contract Act, 1872, all agreements in restraint of trade are void ab initio. The Supreme Court affirmed this in Percept D’Mark v. Zaheer Khan (2006).',
        statutoryLaw: 'Sec 27 Indian Contract Act',
        suggestedFix: 'Replace with standard Non-Disclosure and Client Non-Solicitation clauses limited to 12 months.',
        counterRequestCopy: 'Regarding Clause 7: In alignment with Section 27 of the Indian Contract Act, I request revising this clause to focus on strict protection of proprietary data and non-solicitation of clients, rather than a broad restriction on lawful employment.'
      },
      {
        id: 11,
        clauseNumber: 'Clause 11',
        title: '18-Month Service Bond & Liquidated Damages',
        subject: 'Forced Employment & Penalty Assessment',
        severity: 'high',
        severityLabel: '🚨 High Concern • Disproportionate Damages',
        originalText: '“Employee agrees that early resignation prior to 18 months service requires repayment of ₹3,00,000 as liquidated damages for orientation.”',
        plainMeaning: 'If you leave before 1.5 years, the company claims ₹3 Lakhs regardless of whether they actually spent that amount on formal external certifications.',
        statutoryContext: 'Under Indian law (Toshiba Anand Lamps v. Collector, Sicpa India), companies can only recover genuine out-of-pocket training costs backed by GST invoices, not punitive penalties.',
        statutoryLaw: 'Sec 74 Indian Contract Act',
        suggestedFix: 'Limit any training recovery strictly to verifiable third-party certification invoices prorated over months served.',
        counterRequestCopy: 'Regarding Clause 11: Requesting that training repayment be strictly tied to actual documented external course costs on a prorated basis.'
      },
      {
        id: 3,
        clauseNumber: 'Clause 3',
        title: 'Working Hours & Delivery Milestones',
        subject: 'Flexible Scheduling Terms',
        severity: 'fair',
        severityLabel: '✅ Standard & Fair',
        originalText: '“Working hours shall be flexible, subject to project delivery deadlines.”',
        plainMeaning: 'Standard tech startup working hours clause with expectation of core availability.',
        statutoryContext: 'Complies with State Shops & Commercial Establishments Act exemptions for IT employees.',
        statutoryLaw: 'State Shops & Est Act'
      }
    ],
    emailSubject: 'Discussion on offer terms - Software Engineer II - [Employee Name]',
    emailBody: `Dear HR Team,

Thank you for the offer for the Software Engineer II position at [Company Name]. I am thrilled by the prospect of joining the engineering team.

Upon reviewing the employment contract draft, I noticed Clause 7 includes a post-termination non-compete for 24 months, and Clause 11 sets a ₹3,00,000 bond. In alignment with standard industry practices and Section 27 of the Indian Contract Act, could we adjust Clause 7 to a standard Non-Disclosure and Non-Solicit agreement? Regarding Clause 11, could we specify that training reimbursement applies only to documented external certifications on a prorated basis?

I look forward to finalizing the terms and commencing my journey with [Company Name].

Warm regards,
[Employee Name]`
  },
  freelance: {
    id: 'freelance',
    title: 'Freelance Service & Retainer Agreement',
    category: 'Freelance / Consulting Retainer',
    categoryKey: 'freelance',
    fairnessScore: 68,
    totalClauses: 10,
    highConcern: 1,
    worthNoting: 2,
    standardFair: 7,
    primaryActionRequired: 'Clause 8 strips all copyright and moral rights unconditionally without awaiting milestone invoice clearance, and Clause 5 delays payment to 90 days.',
    contractText: `INDEPENDENT CONTRACTOR RETAINER
CLIENT: [Client / Agency Name, City]
CONSULTANT: [Consultant / Freelancer Name], UI/UX Designer

CLAUSE 1: Deliverables include mobile application wireframes and high-fidelity Figma components.

CLAUSE 5: Payment shall be disbursed within 90 days from verified invoice submission.

CLAUSE 8: All intellectual property and moral rights created at any time during the engagement shall vest perpetually in Client worldwide, with no portfolio attribution permitted without prior written consent.`,
    clauses: [
      {
        id: 8,
        clauseNumber: 'Clause 8',
        title: 'Unconditional Perpetual IP Surrender & Attribution Gag',
        subject: 'Intellectual Property & Portfolio Rights',
        severity: 'high',
        severityLabel: '🚨 High Concern • No Leverage for Payment',
        originalText: '“All intellectual property and moral rights created at any time during the engagement shall vest perpetually in Client worldwide, with no portfolio attribution permitted without prior written consent.”',
        plainMeaning: 'The client owns all your designs immediately—even if they default or never pay your invoices. You also cannot display the work in your portfolio.',
        statutoryContext: 'Under the Indian Copyright Act, 1957, assignment of copyright can and should be conditioned on payment of agreed consideration.',
        statutoryLaw: 'Indian Copyright Act, 1957',
        suggestedFix: 'State that IP transfers strictly upon receipt of 100% full invoice clearance, with reasonable portfolio case study rights.',
        counterRequestCopy: 'Regarding Clause 8: Standard design freelance practice transfers copyright upon 100% settlement of milestone fees, retaining non-commercial portfolio display rights.'
      },
      {
        id: 5,
        clauseNumber: 'Clause 5',
        title: '90-Day Payment Terms',
        subject: 'Payment Schedule & Cash Flow Delay',
        severity: 'warning',
        severityLabel: '⚠️ Worth Noting • Exceeds MSME Statutory 45-Day Cap',
        originalText: '“Payment shall be disbursed within 90 days from verified invoice submission.”',
        plainMeaning: 'You will have to wait 3 full months to get paid after delivering the work.',
        statutoryContext: 'Under Section 15 of the MSMED Act, 2006, payment terms cannot legally exceed 45 days for registered micro/small enterprises.',
        statutoryLaw: 'MSMED Act, 2006 • Sec 15',
        suggestedFix: 'Adjust payment term to Net 15 or Net 30 days maximum, with 50% upfront retainer.',
        counterRequestCopy: 'Regarding Clause 5: Requesting standard Net 15 or Net 30 payment timeline to keep billing cycles sustainable.'
      },
      {
        id: 1,
        clauseNumber: 'Clause 1',
        title: 'Scope of Deliverables',
        subject: 'Design Milestones',
        severity: 'fair',
        severityLabel: '✅ Standard & Fair',
        originalText: '“Deliverables include mobile application wireframes and high-fidelity Figma components.”',
        plainMeaning: 'Clear scope definition for UI/UX deliverables.',
        statutoryContext: 'Defines deliverables clearly under general contract rules.',
        statutoryLaw: 'Contract Law Baseline'
      }
    ],
    emailSubject: 'Refinement to Retainer Agreement - [Consultant Name]',
    emailBody: `Dear [Client Name] Team,

Thank you for sending over the Independent Contractor Retainer. I am eager to collaborate on the Figma components for this project.

Before beginning the sprint, I have two standard adjustments:
1. Clause 5 (Payment Terms): Could we adjust the payment terms from 90 days to Net 30 days (with a 50% upfront milestone)?
2. Clause 8 (IP Transfer): Could we specify that copyright transfer is conditioned upon receipt of the final invoice payment, with permission for non-commercial portfolio display?

Once adjusted, I am ready to sign and commence the initial wireframes immediately.

Best regards,
[Consultant Name]`
  },
  nda: {
    id: 'nda',
    title: 'Standard Mutual Non-Disclosure Agreement',
    category: 'Non-Disclosure Agreement',
    categoryKey: 'nda',
    fairnessScore: 78,
    totalClauses: 9,
    highConcern: 0,
    worthNoting: 2,
    standardFair: 7,
    primaryActionRequired: 'Clause 6 mandates perpetual confidentiality without a sunset clause, which is unusual for commercial conversations.',
    contractText: `NON-DISCLOSURE & PROPRIETARY INFORMATION AGREEMENT
PARTIES: [Disclosing Party / Company A] & [Receiving Party / Company B]

CLAUSE 2: Scope includes proprietary algorithms, customer lists, and raw data dumps.

CLAUSE 6: The confidentiality obligations under this Agreement shall persist in perpetuity without sunset or expiration.

CLAUSE 9: Parties agree to settle any disagreements via sole arbitration conducted in New Delhi under Indian Arbitration and Conciliation Act, 1996.`,
    clauses: [
      {
        id: 6,
        clauseNumber: 'Clause 6',
        title: 'Perpetual Confidentiality Term',
        subject: 'Sunset Period & Obligation Duration',
        severity: 'warning',
        severityLabel: '⚠️ Worth Noting • Perpetual Sunset Missing',
        originalText: '“The confidentiality obligations under this Agreement shall persist in perpetuity without sunset or expiration.”',
        plainMeaning: 'You will remain legally bound by secrecy forever, even 10 or 20 years later, rather than the customary 2 to 3-year term.',
        statutoryContext: 'Courts favor reasonable commercial sunset periods (typically 24-36 months) for general business discussions.',
        statutoryLaw: 'Commercial Restraint Standards',
        suggestedFix: 'Propose a standard 2-year or 3-year sunset period for trade disclosures.',
        counterRequestCopy: 'Regarding Clause 6: Requesting a standard 24-month term for confidentiality obligations post-disclosure.'
      },
      {
        id: 9,
        clauseNumber: 'Clause 9',
        title: 'Arbitration in New Delhi',
        subject: 'Dispute Resolution Venue',
        severity: 'warning',
        severityLabel: '⚠️ Worth Noting • Potential Travel Cost for Remote Party',
        originalText: '“Parties agree to settle any disagreements via sole arbitration conducted in New Delhi under Indian Arbitration and Conciliation Act, 1996.”',
        plainMeaning: 'Any legal disagreement must be arbitrated in New Delhi, requiring travel and accommodation if you are located in another state.',
        statutoryContext: 'Governed by Indian Arbitration and Conciliation Act, 1996.',
        statutoryLaw: 'Arbitration & Conciliation Act 1996',
        suggestedFix: 'Add provision for virtual arbitration hearings or mutual city compromise.',
        counterRequestCopy: 'Regarding Clause 9: Please add that arbitration proceedings may be conducted virtually via video conferencing.'
      },
      {
        id: 2,
        clauseNumber: 'Clause 2',
        title: 'Confidential Information Definition',
        subject: 'Protected Technical Scope',
        severity: 'fair',
        severityLabel: '✅ Standard & Fair',
        originalText: '“Scope includes proprietary algorithms, customer lists, and raw data dumps.”',
        plainMeaning: 'Appropriate and standard definition of confidential trade secrets.',
        statutoryContext: 'Standard commercial IP confidentiality practice.',
        statutoryLaw: 'Common Law Trade Secret'
      }
    ],
    emailSubject: 'Mutual NDA Review - [Company A] & [Company B]',
    emailBody: `Dear Team,

Thank you for sharing the draft Mutual NDA. We are looking forward to our exploratory technical discussions.

We would like to request two standard revisions:
1. Clause 6 (Term): Cap the confidentiality obligation duration to 24 months from the date of disclosure.
2. Clause 9 (Dispute Resolution): Specify that any arbitration proceedings may be conducted virtually to keep administrative costs reasonable.

Once updated, we will execute the agreement promptly.

Warm regards`
  }
};

export const BENCHMARK_ITEMS: BenchmarkTabItem[] = [
  {
    key: 'rent',
    label: 'Rent Deposit',
    predatoryTitle: '10-Month Lock-in & Arbitrary Security Deductions',
    predatoryText: '“The Tenant agrees that the entire Security Deposit equivalent to 10 months rent shall remain with the Owner. In case the Tenant vacates before 24 months, the entire deposit will be forfeited. Further, upon vacating, the Owner reserves the right to deduct painting, deep cleaning, and any discretionary refurbishment amounts as determined solely by the Owner, within 90 days after physical possession is returned.”',
    predatoryRisk1: '90-day refund gives the landlord interest-free leverage indefinitely.',
    predatoryRisk2: 'Unilateral deductions without bills violate basic civil law restitution principles.',
    fairTitle: 'Standard 3-Month Deposit with 7-Day Net Banking Refund',
    fairText: '“The Licensor/Landlord acknowledges receipt of an interest-free Security Deposit equivalent to 3 months license fee. Upon peaceful handover of keys, the Landlord shall refund the entire deposit via electronic transfer within 7 calendar days, subject only to deductions for actual unpaid utility bills or physical damages exceeding reasonable wear-and-tear, backed by itemized contractor tax invoices.”',
    fairBenefit1: 'Mandatory 7-day electronic refund protects tenant cash flow.',
    fairBenefit2: 'Itemized tax invoice requirement prevents arbitrary inflated painting deductions.'
  },
  {
    key: 'noncompete',
    label: 'Non-Compete',
    predatoryTitle: 'Perpetual Pan-India Employment Restraint',
    predatoryText: '“For a period of 24 (twenty-four) months following termination of employment for any reason whatsoever, the Employee agrees not to accept employment, consult, advise, or engage directly or indirectly with any entity anywhere in the Republic of India or globally that operates in any business competing with the Employer.”',
    predatoryRisk1: 'Totally void under Section 27 of the Indian Contract Act, 1872.',
    predatoryRisk2: 'Threatening language is designed solely to intimidate employees from career advancement.',
    fairTitle: 'Lawful Non-Solicitation & Trade Secret Shield',
    fairText: '“The Employee agrees that for 12 months following cessation of employment, they shall not intentionally solicit, entice, or induce current key staff members or direct clients of the Company with whom the Employee directly worked during their last 6 months. Post-employment non-compete restrictions are governed by Section 27 of the Indian Contract Act, 1872.”',
    fairBenefit1: 'Protects actual proprietary business relationships legally and reasonably.',
    fairBenefit2: 'Respects the constitutional right to earn a livelihood (Article 19(1)(g)).'
  },
  {
    key: 'ip',
    label: 'Freelance IP',
    predatoryTitle: 'Immediate & Unconditional Freelance IP Surrender',
    predatoryText: '“All intellectual property, code, mockups, and preliminary concepts created during the engagement shall become the sole and exclusive property of the Client immediately upon creation, irrespective of whether milestone payments or final invoices have been settled.”',
    predatoryRisk1: 'Leaves the freelance developer with zero leverage if the client cancels payment.',
    predatoryRisk2: 'Attempts to capture unapproved drafts, scraps, and modular reusable utility libraries.',
    fairTitle: 'IP Release Conditioned Upon 100% Final Settlement',
    fairText: '“All rights, title, and interest including copyright in the final Deliverables explicitly accepted by the Client shall transfer to the Client solely upon clearance of full and final payment. Pre-existing proprietary developer tooling, modular boilerplates, and unused draft concepts remain the intellectual property of the Contractor.”',
    fairBenefit1: 'Ensures freelancers get paid before handing over full economic control.',
    fairBenefit2: 'Safeguards general development tools and foundational reusable code.'
  }
];

export const MYTH_ITEMS: MythItem[] = [
  {
    id: 'myth-1',
    category: 'Renting',
    myth: '"My landlord can unlock the flat whenever they want because the property belongs to them."',
    fact: 'Once a valid lease starts, the tenant enjoys exclusive possession. Landlords entering without 24-hour advance written notice or your explicit consent constitute unlawful trespass under Indian law.'
  },
  {
    id: 'myth-2',
    category: 'Jobs',
    myth: '"If I resign during probation, the company can confiscate my degree certificates."',
    fact: 'Retaining original academic certificates is strictly prohibited by AICTE, UGC, and violates fundamental property rights. Employers have no legal authority to retain your original documents.'
  },
  {
    id: 'myth-3',
    category: 'Freelance',
    myth: '"A WhatsApp agreement isn\'t legally binding in India. Only stamp paper counts."',
    fact: 'Under Section 65B of the Indian Evidence Act and the IT Act 2000, electronic communications (emails, WhatsApp agreements with offer, acceptance, and consideration) form a legally valid contract admissible in court.'
  }
];

export const FAQ_ITEMS = [
  {
    question: "Is my uploaded contract stored on your servers?",
    answer: "No, never. Law Counsel operates on a volatile ephemeral processing architecture. When you paste a clause or inspect a document, the text exists only in volatile server memory for the duration of that request and is immediately purged. We do not maintain databases of user agreements, do not train public AI models on your clauses, and never share or sell agreements to third parties, brokers, or employers."
  },
  {
    question: "Can Law Counsel represent me in court or draft bespoke deeds?",
    answer: "No. Law Counsel is strictly a civic educational readability and literacy engine. We are not a law firm, we are not registered advocates with the Bar Council of India, and using this portal does not create an advocate-client relationship. If you are served with an eviction notice, demand notice under Section 138, or facing industrial dispute proceedings, you must retain an enrolled advocate through your State Bar Council or seek legal aid through DLSA."
  },
  {
    question: "Will you support regional Indian languages like Hindi, Tamil, and Kannada?",
    answer: "Yes, in active development. Dual-language explanations in simple Hindi are currently rolling out in beta, with support planned for regional languages including Tamil, Kannada, Marathi, and Telugu. You will be able to toggle the full plain-language comparison in your preferred language."
  }
];

