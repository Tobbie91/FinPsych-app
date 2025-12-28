// 5Cs of Credit Categories
export type CreditCategory = 'Character' | 'Capacity' | 'Capital' | 'Conditions' | 'Collateral';

export interface Question {
  id: string;
  number: number;
  text: string;
  type: 'scale' | 'select' | 'ranking' | 'text' | 'email';
  options: string[];
  category: CreditCategory;
  categoryDescription: string;
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
  // SECTION A: Demographic Information (always first)
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
        category: 'Character',
        categoryDescription: 'Basic identification',
      },
      {
        id: 'demo2',
        number: 2,
        text: 'Kindly enter your email address',
        type: 'email',
        options: [],
        category: 'Character',
        categoryDescription: 'Contact information',
      },
      {
        id: 'demo3',
        number: 3,
        text: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
        category: 'Conditions',
        categoryDescription: 'Demographic data',
      },
      {
        id: 'demo4',
        number: 4,
        text: 'How old are you?',
        type: 'select',
        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
        category: 'Conditions',
        categoryDescription: 'Demographic data',
      },
      {
        id: 'demo5',
        number: 5,
        text: 'Marital Status',
        type: 'select',
        options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
        category: 'Conditions',
        categoryDescription: 'Demographic data',
      },
      {
        id: 'demo6',
        number: 6,
        text: 'Highest Level of Education',
        type: 'select',
        options: ['Primary School', 'Secondary School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'],
        category: 'Conditions',
        categoryDescription: 'Demographic data',
      },
      {
        id: 'demo7',
        number: 7,
        text: 'Employment Status',
        type: 'select',
        options: ['Employed (Full-time)', 'Employed (Part-time)', 'Self-employed', 'Unemployed', 'Student', 'Retired'],
        category: 'Capacity',
        categoryDescription: 'Ability to meet repayment obligations',
      },
      {
        id: 'demo8',
        number: 8,
        text: 'Monthly Income Range',
        type: 'select',
        options: ['Below $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Above $10,000'],
        category: 'Capacity',
        categoryDescription: 'Ability to meet repayment obligations',
      },
      {
        id: 'demo9',
        number: 9,
        text: 'Number of People Who Depend on Your Income',
        type: 'select',
        options: ['0', '1-2', '3-4', '5+'],
        category: 'Conditions',
        categoryDescription: 'Demographic data',
      },
      {
        id: 'demo10',
        number: 10,
        text: 'Do you have an active bank account?',
        type: 'select',
        options: ['Yes', 'No'],
        category: 'Capital',
        categoryDescription: 'Financial reserves',
      },
    ],
  },
  // SECTION B: Payment History & Financial Behaviour
  {
    id: 'section-b',
    title: 'Section B',
    subtitle: 'Payment History & Financial Behaviour',
    questions: [
      {
        id: 'q1',
        number: 11,
        text: 'In the past 12 months, how often did you miss RENT payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q2',
        number: 12,
        text: 'In the past 12 months, how often did you miss UTILITY payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q3',
        number: 13,
        text: 'In the past 12 months, how often did you miss MOBILE/BROADBAND payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q4',
        number: 14,
        text: 'In the past 12 months, how often did you miss INSURANCE payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q5',
        number: 15,
        text: 'In the past 12 months, how often did you miss SUBSCRIPTION payments?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q6',
        number: 16,
        text: 'How often have you had to renegotiate payment terms with lenders or service providers?',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q7',
        number: 17,
        text: 'I check my account balance regularly.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q8',
        number: 18,
        text: 'I track my expenses consistently.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q9',
        number: 19,
        text: 'I save money regularly.',
        type: 'scale',
        options: frequencyScale,
        category: 'Capital',
        categoryDescription: 'Financial reserves',
      },
      {
        id: 'q10',
        number: 20,
        text: 'I pay my bills on time.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q11',
        number: 21,
        text: 'I follow a monthly budget.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q12',
        number: 22,
        text: 'I compare prices before making purchases.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q13',
        number: 23,
        text: 'I am able to achieve my financial goals.',
        type: 'scale',
        options: frequencyScale,
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
    ],
  },
  // SECTION C: Emergency Preparedness
  {
    id: 'section-c',
    title: 'Section C',
    subtitle: 'Emergency Preparedness',
    questions: [
      {
        id: 'q14',
        number: 24,
        text: 'If an unexpected expense occurred today, which option would you rely on first?',
        type: 'select',
        options: ['Personal savings', 'Borrow from family/friends', 'Sell an asset', 'Take a loan', 'Other'],
        category: 'Capacity',
        categoryDescription: 'Ability to meet repayment obligations',
      },
      {
        id: 'q15',
        number: 25,
        text: 'How many months of emergency savings do you currently have?',
        type: 'select',
        options: ['None', '1 month', '2–3 months', '4–6 months', 'More than 6 months'],
        category: 'Capital',
        categoryDescription: 'Financial reserves',
      },
    ],
  },
  // SECTION D: Crisis Decision-Making
  {
    id: 'section-d',
    title: 'Section D',
    subtitle: 'Crisis Decision-Making',
    questions: [
      {
        id: 'q16',
        number: 26,
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
        categoryDescription: 'Financial behaviour and reliability',
      },
    ],
  },
  // SECTION E: Personality (Big Five)
  {
    id: 'section-e',
    title: 'Section E',
    subtitle: 'Personality (Big Five)',
    questions: [
      // Conscientiousness
      { id: 'q17', number: 27, text: 'I pay attention to details.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q18', number: 28, text: 'I follow schedules.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q19', number: 29, text: 'I complete tasks efficiently.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q20', number: 30, text: 'I am always prepared.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q21', number: 31, text: 'I get chores done right away.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      // Emotional Stability
      { id: 'q22', number: 32, text: 'I often feel stressed.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q23', number: 33, text: 'I worry about many things.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q24', number: 34, text: 'I get upset easily.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q25', number: 35, text: 'I feel anxious frequently.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q26', number: 36, text: 'I have frequent mood swings.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      // Agreeableness
      { id: 'q27', number: 37, text: "I sympathise with others' feelings.", type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q28', number: 38, text: 'I take time out for others.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q29', number: 39, text: "I feel others' emotions.", type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q30', number: 40, text: 'I make people feel at ease.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q31', number: 41, text: 'I am interested in others.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      // Openness
      { id: 'q32', number: 42, text: 'I have a vivid imagination.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q33', number: 43, text: 'I enjoy reflecting on ideas.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q34', number: 44, text: 'I value artistic experiences.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q35', number: 45, text: 'I am curious about new things.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q36', number: 46, text: 'I enjoy exploring new concepts.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      // Extraversion
      { id: 'q37', number: 47, text: 'I am the life of the party.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q38', number: 48, text: 'I feel comfortable around people.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q39', number: 49, text: 'I start conversations easily.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q40', number: 50, text: 'I talk to many people at social gatherings.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q41', number: 51, text: "I don't mind being the centre of attention.", type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
    ],
  },
  // SECTION F: Risk Preference
  {
    id: 'section-f',
    title: 'Section F',
    subtitle: 'Risk Preference',
    questions: [
      { id: 'q42', number: 52, text: 'I see myself as a risk-taker.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q43', number: 53, text: 'In a game show, I would choose the riskier option.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q44', number: 54, text: "I associate the word 'risk' with opportunity.", type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q45', number: 55, text: 'I would shift my assets to pursue higher returns.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q46', number: 56, text: 'I am comfortable with potential losses over several years.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
    ],
  },
  // SECTION G: Self-Control & Impulse Management
  {
    id: 'section-g',
    title: 'Section G',
    subtitle: 'Self-Control & Impulse Management',
    questions: [
      { id: 'q47', number: 57, text: 'I resist temptations well.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q48', number: 58, text: 'I act impulsively.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q49', number: 59, text: 'I buy things without thinking.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q50', number: 60, text: 'I can stay focused on long-term goals.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q51', number: 61, text: 'I avoid unnecessary spending.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q52', number: 62, text: 'I control my urges to spend impulsively.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
      { id: 'q53', number: 63, text: 'I think carefully before making purchases.', type: 'scale', options: frequencyScale, category: 'Character', categoryDescription: 'Financial behaviour and reliability' },
    ],
  },
  // SECTION H: Locus of Control
  {
    id: 'section-h',
    title: 'Section H',
    subtitle: 'Locus of Control',
    questions: [
      {
        id: 'q54',
        number: 64,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['My financial security depends mainly on my own actions.', 'External factors determine my financial situation.'],
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q55',
        number: 65,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['Financial planning helps me achieve goals.', 'Luck determines financial outcomes.'],
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q56',
        number: 66,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['Financial success comes from hard work.', 'Financial success comes from being in the right place at the right time.'],
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q57',
        number: 67,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['I can achieve the financial goals I set.', "Financial goals often don't work out regardless."],
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
      {
        id: 'q58',
        number: 68,
        text: 'Choose the statement that best reflects your belief:',
        type: 'select',
        options: ['I am responsible for my financial well-being.', 'External forces determine my situation.'],
        category: 'Character',
        categoryDescription: 'Financial behaviour and reliability',
      },
    ],
  },
  // SECTION I: Social Support & Time Orientation
  {
    id: 'section-i',
    title: 'Section I',
    subtitle: 'Social Support & Time Orientation',
    questions: [
      {
        id: 'q59',
        number: 69,
        text: 'How many people could you ask to borrow money in an emergency?',
        type: 'select',
        options: ['None', '1–2 people', '3–5 people', '6–10 people', 'More than 10'],
        category: 'Collateral',
        categoryDescription: 'Support network',
      },
      {
        id: 'q60',
        number: 70,
        text: 'How often do you think about your financial situation 5 years from now?',
        type: 'scale',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
        category: 'Capacity',
        categoryDescription: 'Ability to meet repayment obligations',
      },
      {
        id: 'q61',
        number: 71,
        text: 'I believe small financial decisions today significantly affect my future.',
        type: 'scale',
        options: frequencyScale,
        category: 'Capacity',
        categoryDescription: 'Ability to meet repayment obligations',
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
