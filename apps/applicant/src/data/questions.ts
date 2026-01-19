// 5Cs of Credit Categories
export type CreditCategory = 'Character' | 'Capacity' | 'Capital' | 'Conditions' | 'Collateral';

// Construct types for CWI scoring
export type Construct =
  | 'payment_history'
  | 'financial_behaviour'
  | 'emergency_preparedness'
  | 'crisis_decision_making'
  | 'conscientiousness'
  | 'emotional_stability'
  | 'agreeableness'
  | 'openness'
  | 'extraversion'
  | 'risk_preference'
  | 'self_control'
  | 'locus_of_control'
  | 'social_support'
  | 'time_orientation'
  | 'cognitive_reflection'
  | 'delay_discounting'
  | 'financial_numeracy'
  | 'demographic';

export interface Question {
  id: string;
  number: number;
  text: string;
  type: 'scale' | 'select' | 'ranking' | 'text' | 'email';
  options: string[];
  category?: CreditCategory;
  categoryDescription?: string;
  isDemographic?: boolean;
  // Scoring fields
  construct?: Construct;
  reverseScored?: boolean; // For items like missed payments, stress, impulsivity
  fiveC?: CreditCategory; // Which of the 5Cs this maps to
}

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  questions: Question[];
}

// Standard scale options used across most questions
const frequencyScale = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

export const sections: Section[] = [
  // SECTION A: Demographic Information (13 questions)
  {
    id: 'section-a',
    title: 'Section A',
    subtitle: 'Demographic Information',
    questions: [
      {
        id: 'demo1',
        number: 1,
        text: 'What is your full name?',
        type: 'text',
        options: [],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo2',
        number: 2,
        text: 'Kindly enter your email address',
        type: 'email',
        options: [],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo3',
        number: 3,
        text: 'Country of residence',
        type: 'select',
        options: ['Nigeria', 'United Kingdom', 'United States'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo4',
        number: 4,
        text: 'How old are you?',
        type: 'select',
        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo5',
        number: 5,
        text: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo6',
        number: 6,
        text: 'Marital Status',
        type: 'select',
        options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo7',
        number: 7,
        text: 'Highest Level of Education',
        type: 'select',
        options: ['Primary School', 'Secondary School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo8',
        number: 8,
        text: 'Employment Status',
        type: 'select',
        options: ['Employed (Full-time)', 'Employed (Part-time)', 'Self-employed', 'Unemployed', 'Student', 'Retired'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo9',
        number: 9,
        text: 'Monthly Income Range',
        type: 'select',
        options: ['Below $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Above $10,000'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo10',
        number: 10,
        text: 'Number of People Who Depend on Your Income',
        type: 'select',
        options: ['0', '1-2', '3-4', '5+'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo11',
        number: 11,
        text: 'Do you have an active bank account?',
        type: 'select',
        options: ['Yes', 'No'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo12',
        number: 12,
        text: 'Have you taken a loan before?',
        type: 'select',
        options: ['Yes, and fully repaid', 'Yes, currently repaying', 'Yes, but defaulted', 'No, never'],
        isDemographic: true,
        construct: 'demographic',
      },
      {
        id: 'demo13',
        number: 13,
        text: 'Residency Status',
        type: 'select',
        options: ['Citizen', 'Permanent Resident', 'Work Permit', 'Student Visa', 'Other'],
        isDemographic: true,
        construct: 'demographic',
      },
    ],
  },
  // SECTION B: Financial Behaviour (Q1-Q15)
  {
    id: 'section-b',
    title: 'Section B',
    subtitle: 'Financial Behaviour',
    questions: [
      // Payment History - Q1-Q6 (reverse scored - higher "missed" = lower score)
      {
        id: 'q1',
        number: 14,
        text: 'In the past 12 months, how often did you miss RENT payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      {
        id: 'q2',
        number: 15,
        text: 'In the past 12 months, how often did you miss UTILITY payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      {
        id: 'q3',
        number: 16,
        text: 'In the past 12 months, how often did you miss MOBILE/BROADBAND payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      {
        id: 'q4',
        number: 17,
        text: 'In the past 12 months, how often did you miss INSURANCE payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      {
        id: 'q5',
        number: 18,
        text: 'In the past 12 months, how often did you miss SUBSCRIPTION payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      {
        id: 'q6',
        number: 19,
        text: 'How often have you had to renegotiate payment terms with lenders or service providers?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'payment_history',
        reverseScored: true,
        fiveC: 'Character',
      },
      // Financial Behaviour - Q7-Q13 (regular scoring - higher = better)
      {
        id: 'q7',
        number: 20,
        text: 'I check my account balance regularly.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q8',
        number: 21,
        text: 'I track my expenses consistently.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q9',
        number: 22,
        text: 'I save money regularly.',
        type: 'scale',
        options: frequencyScale,
        category: 'Capital',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Capital',
      },
      {
        id: 'q10',
        number: 23,
        text: 'I pay my bills on time.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q11',
        number: 24,
        text: 'I follow a monthly budget.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q12',
        number: 25,
        text: 'I compare prices before making purchases.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q13',
        number: 26,
        text: 'I am able to achieve my financial goals.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        construct: 'financial_behaviour',
        reverseScored: false,
        fiveC: 'Character',
      },
      // Emergency Preparedness - Q14-Q15
      {
        id: 'q14',
        number: 27,
        text: 'If an unexpected expense occurred today, which option would you rely on first?',
        type: 'select',
        options: ['Personal savings', 'Borrow from family/friends', 'Sell an asset', 'Take a loan', 'Other'],
        category: 'Capacity',
        construct: 'emergency_preparedness',
        reverseScored: false,
        fiveC: 'Capacity',
      },
      {
        id: 'q15',
        number: 28,
        text: 'How many months of emergency savings do you currently have?',
        type: 'select',
        options: ['None', '1 month', '2–3 months', '4–6 months', 'More than 6 months'],
        category: 'Capital',
        construct: 'emergency_preparedness',
        reverseScored: false,
        fiveC: 'Capital',
      },
    ],
  },
  // SECTION C: Crisis Decision-Making (Q16)
  {
    id: 'section-c',
    title: 'Section C',
    subtitle: 'Crisis Decision-Making',
    questions: [
      {
        id: 'q16',
        number: 29,
        text: 'In a financial crisis, rank the following from 1 (first priority) to 6 (last priority):',
        type: 'ranking',
        options: [
          'Contact lender',
          'Borrow from family/friends',
          'Skip payments',
          'Prioritise other expenses',
          'Sell assets',
          'Work extra hours',
        ],
        category: 'Character',
        construct: 'crisis_decision_making',
        reverseScored: false,
        fiveC: 'Character',
      },
    ],
  },
  // SECTION D: Personality (Big Five) - Q17-Q41
  {
    id: 'section-d',
    title: 'Section D',
    subtitle: 'Personality (Big Five)',
    questions: [
      // Conscientiousness - Q17-Q21 (regular scoring)
      { id: 'q17', number: 30, text: 'I pay attention to details.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'conscientiousness', reverseScored: false, fiveC: 'Character' },
      { id: 'q18', number: 31, text: 'I follow schedules.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'conscientiousness', reverseScored: false, fiveC: 'Character' },
      { id: 'q19', number: 32, text: 'I complete tasks efficiently.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'conscientiousness', reverseScored: false, fiveC: 'Character' },
      { id: 'q20', number: 33, text: 'I am always prepared.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'conscientiousness', reverseScored: false, fiveC: 'Character' },
      { id: 'q21', number: 34, text: 'I get chores done right away.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'conscientiousness', reverseScored: false, fiveC: 'Character' },
      // Emotional Stability (Reversed Neuroticism) - Q22-Q26 (reverse scored - higher stress/anxiety = lower score)
      { id: 'q22', number: 35, text: 'I often feel stressed.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'emotional_stability', reverseScored: true, fiveC: 'Character' },
      { id: 'q23', number: 36, text: 'I worry about many things.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'emotional_stability', reverseScored: true, fiveC: 'Character' },
      { id: 'q24', number: 37, text: 'I get upset easily.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'emotional_stability', reverseScored: true, fiveC: 'Character' },
      { id: 'q25', number: 38, text: 'I feel anxious frequently.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'emotional_stability', reverseScored: true, fiveC: 'Character' },
      { id: 'q26', number: 39, text: 'I have frequent mood swings.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'emotional_stability', reverseScored: true, fiveC: 'Character' },
      // Agreeableness - Q27-Q31 (regular scoring)
      { id: 'q27', number: 40, text: "I sympathise with others' feelings.", type: 'scale', options: frequencyScale, category: 'Character', construct: 'agreeableness', reverseScored: false, fiveC: 'Character' },
      { id: 'q28', number: 41, text: 'I take time out for others.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'agreeableness', reverseScored: false, fiveC: 'Character' },
      { id: 'q29', number: 42, text: "I feel others' emotions.", type: 'scale', options: frequencyScale, category: 'Character', construct: 'agreeableness', reverseScored: false, fiveC: 'Character' },
      { id: 'q30', number: 43, text: 'I make people feel at ease.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'agreeableness', reverseScored: false, fiveC: 'Character' },
      { id: 'q31', number: 44, text: 'I am interested in others.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'agreeableness', reverseScored: false, fiveC: 'Character' },
      // Openness - Q32-Q36 (regular scoring)
      { id: 'q32', number: 45, text: 'I have a vivid imagination.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'openness', reverseScored: false, fiveC: 'Character' },
      { id: 'q33', number: 46, text: 'I enjoy reflecting on ideas.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'openness', reverseScored: false, fiveC: 'Character' },
      { id: 'q34', number: 47, text: 'I value artistic experiences.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'openness', reverseScored: false, fiveC: 'Character' },
      { id: 'q35', number: 48, text: 'I am curious about new things.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'openness', reverseScored: false, fiveC: 'Character' },
      { id: 'q36', number: 49, text: 'I enjoy exploring new concepts.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'openness', reverseScored: false, fiveC: 'Character' },
      // Extraversion - Q37-Q41 (regular scoring)
      { id: 'q37', number: 50, text: 'I am the life of the party.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'extraversion', reverseScored: false, fiveC: 'Character' },
      { id: 'q38', number: 51, text: 'I feel comfortable around people.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'extraversion', reverseScored: false, fiveC: 'Character' },
      { id: 'q39', number: 52, text: 'I start conversations easily.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'extraversion', reverseScored: false, fiveC: 'Character' },
      { id: 'q40', number: 53, text: 'I talk to many people at social gatherings.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'extraversion', reverseScored: false, fiveC: 'Character' },
      { id: 'q41', number: 54, text: "I don't mind being the centre of attention.", type: 'scale', options: frequencyScale, category: 'Character', construct: 'extraversion', reverseScored: false, fiveC: 'Character' },
    ],
  },
  // SECTION E: Risk Preference - Q42-Q46
  {
    id: 'section-e',
    title: 'Section E',
    subtitle: 'Risk Preference',
    questions: [
      { id: 'q42', number: 55, text: 'I see myself as a risk-taker.', type: 'scale', options: frequencyScale, category: 'Conditions', construct: 'risk_preference', reverseScored: false, fiveC: 'Conditions' },
      { id: 'q43', number: 56, text: 'In a game show, I would choose the riskier option.', type: 'scale', options: frequencyScale, category: 'Conditions', construct: 'risk_preference', reverseScored: false, fiveC: 'Conditions' },
      { id: 'q44', number: 57, text: "I associate the word 'risk' with opportunity.", type: 'scale', options: frequencyScale, category: 'Conditions', construct: 'risk_preference', reverseScored: false, fiveC: 'Conditions' },
      { id: 'q45', number: 58, text: 'I would shift my assets to pursue higher returns.', type: 'scale', options: frequencyScale, category: 'Conditions', construct: 'risk_preference', reverseScored: false, fiveC: 'Conditions' },
      { id: 'q46', number: 59, text: 'I am comfortable with potential losses over several years.', type: 'scale', options: frequencyScale, category: 'Conditions', construct: 'risk_preference', reverseScored: false, fiveC: 'Conditions' },
    ],
  },
  // SECTION F: Self-Control & Impulse Management - Q47-Q53
  {
    id: 'section-f',
    title: 'Section F',
    subtitle: 'Self-Control & Impulse Management',
    questions: [
      { id: 'q47', number: 60, text: 'I resist temptations well.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: false, fiveC: 'Character' },
      { id: 'q48', number: 61, text: 'I act impulsively.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: true, fiveC: 'Character' },
      { id: 'q49', number: 62, text: 'I buy things without thinking.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: true, fiveC: 'Character' },
      { id: 'q50', number: 63, text: 'I can stay focused on long-term goals.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: false, fiveC: 'Character' },
      { id: 'q51', number: 64, text: 'I avoid unnecessary spending.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: false, fiveC: 'Character' },
      { id: 'q52', number: 65, text: 'I control my urges to spend impulsively.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: false, fiveC: 'Character' },
      { id: 'q53', number: 66, text: 'I think carefully before making purchases.', type: 'scale', options: frequencyScale, category: 'Character', construct: 'self_control', reverseScored: false, fiveC: 'Character' },
    ],
  },
  // SECTION G: Locus of Control - Q54-Q58
  {
    id: 'section-g',
    title: 'Section G',
    subtitle: 'Locus of Control',
    questions: [
      {
        id: 'q54',
        number: 67,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['My financial security depends mainly on my own actions.', 'External factors determine my financial situation.'],
        category: 'Character',
        construct: 'locus_of_control',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q55',
        number: 68,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['Financial planning helps me achieve goals.', 'Luck determines financial outcomes.'],
        category: 'Character',
        construct: 'locus_of_control',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q56',
        number: 69,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['Financial success comes from hard work.', 'Financial success comes from being in the right place at the right time.'],
        category: 'Character',
        construct: 'locus_of_control',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q57',
        number: 70,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['I can achieve the financial goals I set.', "Financial goals often don't work out regardless."],
        category: 'Character',
        construct: 'locus_of_control',
        reverseScored: false,
        fiveC: 'Character',
      },
      {
        id: 'q58',
        number: 71,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['I am responsible for my financial well-being.', 'External forces determine my situation.'],
        category: 'Character',
        construct: 'locus_of_control',
        reverseScored: false,
        fiveC: 'Character',
      },
    ],
  },
  // SECTION H: Social Support & Time Orientation - Q59-Q61
  {
    id: 'section-h',
    title: 'Section H',
    subtitle: 'Social Support & Time Orientation',
    questions: [
      {
        id: 'q59',
        number: 72,
        text: 'How many people could you ask to borrow money in an emergency?',
        type: 'select',
        options: ['None', '1–2 people', '3–5 people', '6–10 people', 'More than 10'],
        category: 'Collateral',
        construct: 'social_support',
        reverseScored: false,
        fiveC: 'Collateral',
      },
      {
        id: 'q60',
        number: 73,
        text: 'How often do you think about your financial situation 5 years from now?',
        type: 'scale',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
        category: 'Capacity',
        construct: 'time_orientation',
        reverseScored: false,
        fiveC: 'Capacity',
      },
      {
        id: 'q61',
        number: 74,
        text: 'I believe small financial decisions today significantly affect my future.',
        type: 'scale',
        options: frequencyScale,
        category: 'Capacity',
        construct: 'time_orientation',
        reverseScored: false,
        fiveC: 'Capacity',
      },
    ],
  },
  // Section I: Neurocognitive Assessment
  {
    id: 'section-i',
    title: 'Section I',
    subtitle: 'Neurocognitive Assessment',
    questions: [
      {
        id: 'q62',
        number: 75,
        text: 'A bat and a ball cost ₦1,100 in total. The bat costs ₦1,000 more than the ball. How much does the ball cost?',
        type: 'select',
        options: ['₦50', '₦100', '₦550'],
        category: 'Character',
        categoryDescription: 'CRT',
        construct: 'cognitive_reflection',
        fiveC: 'Character',
      },
      {
        id: 'q63',
        number: 76,
        text: 'Would you prefer:',
        type: 'select',
        options: ['A: ₦5,000 today', 'B: ₦7,500 in one month'],
        category: 'Character',
        categoryDescription: 'Delay Discounting',
        construct: 'delay_discounting',
        fiveC: 'Character',
      },
      {
        id: 'q64',
        number: 77,
        text: 'You buy bread for ₦500 and fish for ₦800. You pay with ₦2,000. How much change should you get?',
        type: 'select',
        options: ['₦700', '₦1,200', '₦1,500'],
        category: 'Capacity',
        categoryDescription: 'Financial Numeracy',
        construct: 'financial_numeracy',
        fiveC: 'Capacity',
      },
      {
        id: 'q65',
        number: 78,
        text: 'You need to borrow ₦50,000. Lender A: Pay back ₦55,000 after 1 month. Lender B: Pay back ₦60,000 after 3 months. Which costs you LESS in total interest?',
        type: 'select',
        options: [
          'Lender A (₦5,000 interest)',
          'Lender B (₦10,000 interest)',
          'Same total interest',
        ],
        category: 'Capacity',
        categoryDescription: 'Financial Numeracy',
        construct: 'financial_numeracy',
        fiveC: 'Capacity',
      },
    ],
  },
];

// Helper to get total questions count
export const getTotalQuestions = (): number => {
  return sections.reduce((acc, section) => acc + section.questions.length, 0);
};

// Helper to get section letter (A, B, C, etc.)
export const getSectionLetter = (index: number): string => {
  return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
};

// Category colors for UI
export const categoryColors: Record<CreditCategory, { bg: string; text: string; border: string }> = {
  Character: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Capacity: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Capital: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Conditions: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Collateral: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

// Questions that are reverse scored (for scoring engine)
export const reverseScoreQuestionIds = sections
  .flatMap((s) => s.questions)
  .filter((q) => q.reverseScored)
  .map((q) => q.id);

// Get all questions by construct for scoring
export const getQuestionsByConstruct = (): Record<Construct, string[]> => {
  const result: Record<string, string[]> = {};
  sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.construct && q.construct !== 'demographic') {
        if (!result[q.construct]) {
          result[q.construct] = [];
        }
        result[q.construct].push(q.id);
      }
    });
  });
  return result as Record<Construct, string[]>;
};
