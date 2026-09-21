'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  GitPullRequestDraft,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Layers,
  BarChart3,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
      roles: ['Admin', 'CSM', 'Support', 'Analyst'],
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      roles: ['Admin', 'CSM', 'Support', 'Analyst'],
    },
    {
      name: 'Renewal Pipeline',
      href: '/renewals',
      icon: GitPullRequestDraft,
      roles: ['Admin', 'CSM', 'Analyst'],
    },
    {
      name: 'AI Drafts',
      href: '/ai-drafts',
      icon: Sparkles,
      roles: ['Admin', 'CSM'],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['Admin', 'CSM', 'Analyst'],
    },
    {
      name: 'Plans',
      href: '/plans',
      icon: Layers,
      roles: ['Admin', 'CSM', 'Analyst'],
    },
    {
      name: 'Settings',
      href: role === 'Admin' ? '/settings/churn-rules' : '/support-notes',
      icon: Settings,
      roles: ['Admin', 'CSM', 'Support', 'Analyst'],
    },
  ];

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen justify-between py-6 px-4 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(15,76,129,0.30)]">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-[#0F172A] leading-none flex items-center gap-1.5">
              <span>SubscriptIQ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F61]"></span>
            </h1>
            <p className="text-[11px] text-[#526071] font-medium mt-1">Enterprise Intelligence</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-[#EAF1F8] text-[#0F4C81] font-bold shadow-2xs'
                    : 'text-[#526071] hover:text-[#0F172A] hover:bg-slate-100/70'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-[#0F4C81]' : 'text-[#526071]'
                  )}
                />
                <span>{item.name}</span>
                {item.name === 'AI Drafts' && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#F5F3FA] text-[#5F4B8B] border border-[#DDD6FE]">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => router.push('/plans')}
          className="w-full py-2.5 px-3.5 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl shadow-[0_2px_8px_rgba(15,76,129,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF6F61]" />
          <span>Manage Subscription</span>
        </button>

        <div className="space-y-1 px-1">
          <Link
            href="/support-notes"
            className="flex items-center gap-3 px-2 py-2 text-xs text-[#526071] hover:text-[#0F172A] hover:bg-slate-100/70 rounded-lg font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Support &amp; Notes</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2 py-2 text-xs text-[#526071] hover:text-[#D0272B] hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
