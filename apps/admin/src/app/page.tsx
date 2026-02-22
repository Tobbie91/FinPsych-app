'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; institution_id?: string } | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Get institution_id from user metadata
        const instId = authUser.user_metadata?.institution_id || authUser.id;
        setInstitutionId(instId);
        setUser({
          email: authUser.email,
          institution_id: instId,
        });
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#1e2a3d] to-[#0f1419]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const handleCardClick = (href: string, external: boolean, requiresAuth: boolean, needsInstitutionId: boolean = false) => {
    if (requiresAuth && !user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Add institution_id to URL if needed and available
    let finalHref = href;
    if (needsInstitutionId && institutionId) {
      const separator = href.includes('?') ? '&' : '?';
      finalHref = `${href}${separator}institution=${institutionId}`;
    }

    if (external) {
      window.open(finalHref, '_blank');
    } else {
      router.push(finalHref);
    }
  };

  const cards = [
    {
      title: 'Take Assessment',
      description: 'Complete the interactive creditworthiness assessment with behavioral and cognitive questions',
      icon: ClipboardList,
      href: process.env.NEXT_PUBLIC_APPLICANT_URL || 'https://finpsych-applicant.netlify.app',
      gradient: 'from-[#14b8a6] to-[#06b6d4]',
      buttonText: 'Start Assessment',
      external: true,
      requiresAuth: false, // Public access to take assessment
      needsInstitutionId: true, // Pass institution_id to assessment
    },
    {
      title: 'Bank/Institution Dashboard',
      description: 'Access institution portal to view applicant scores and manage assessments',
      icon: TrendingUp,
      href: process.env.NEXT_PUBLIC_INSTITUTION_URL || 'https://finpsych-finance-institute.netlify.app',
      gradient: 'from-[#3b82f6] to-[#6366f1]',
      buttonText: 'View Dashboard',
      external: true,
      requiresAuth: false, // External app with its own auth
      needsInstitutionId: false, // Institution app has its own auth
    },
    {
      title: 'Admin Console',
      description: 'Monitor system performance and fairness metrics',
      icon: ShieldCheck,
      href: '/dashboard',
      gradient: 'from-[#c026d3] to-[#e879f9]',
      buttonText: 'Access Console',
      external: false,
      requiresAuth: true, // Requires login
      needsInstitutionId: false,
    },
  ];

  const features = [
    {
      title: 'Dual Assessment Framework',
      description: 'CWI psychometric + neurocognitive performance measures',
    },
    {
      title: 'Gaming Detection',
      description: 'Identifies discrepancies between self-report and objective performance',
    },
    {
      title: 'Five Cs Framework',
      description: 'Character, Capacity, Capital, Conditions, Collateral',
    },
    {
      title: '98.7% Accuracy',
      description: 'Validated with 1,000 Nigerian respondents',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2a3d] to-[#0f1419]">
      {/* Main Content */}
      <main className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              FinPsych Score
            </h1>
            <p className="text-xl md:text-2xl text-teal-400 mb-3 font-medium">
              Hybrid Psychometric–Neurocognitive Credit Assessment Framework.
            </p>
            <p className="text-lg text-gray-300">
              Redefining creditworthiness evaluation for credit invisibles.
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-8 text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl cursor-pointer group`}
                  onClick={() => handleCardClick(card.href, card.external, card.requiresAuth, card.needsInstitutionId)}
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Button */}
                  <div className="flex items-center text-white font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>{card.buttonText}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Features Section */}
          <div className="bg-gradient-to-r from-[#1e3a5f]/40 to-[#1a4d5c]/40 backdrop-blur-sm rounded-3xl border border-teal-500/20 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8">Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-400">
            <p className="text-sm">
              Glasgow Caledonian University | Research-Backed Solution
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
