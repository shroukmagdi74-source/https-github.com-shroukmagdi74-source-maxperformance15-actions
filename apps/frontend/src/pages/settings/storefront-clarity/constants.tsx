import React from 'react';
import {
  CursorArrowRaysIcon,
  FireIcon,
  FunnelIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { ClarityFeature, ClaritySetupStep, ClarityUsefulLink } from './types';

export const FEATURES: ClarityFeature[] = [
  {
    icon: <FireIcon className="h-6 w-6 text-orange-500" />,
    titleKey: 'clarity.feature.heatmaps',
    title: 'خرائط الحرارة',
    subtitle: 'Heatmaps',
    descKey: 'clarity.feature.heatmaps.desc',
    desc: 'شوف إيه الأجزاء اللي الزبائن بيضغطوا عليها أكتر في متجرك وإيه اللي ملقوش فيه.',
    color: 'border-orange-100 bg-orange-50 dark:border-orange-800/30 dark:bg-orange-900/20',
  },
  {
    icon: <PlayCircleIcon className="h-6 w-6 text-violet-500" />,
    titleKey: 'clarity.feature.recordings',
    title: 'تسجيل الجلسات',
    subtitle: 'Session Recordings',
    descKey: 'clarity.feature.recordings.desc',
    desc: 'شاهد فيديو كامل لرحلة الزبون من دخول المتجر لحد ما اشترى أو خرج.',
    color: 'border-violet-100 bg-violet-50 dark:border-violet-800/30 dark:bg-violet-900/20',
  },
  {
    icon: <CursorArrowRaysIcon className="h-6 w-6 text-red-500" />,
    titleKey: 'clarity.feature.rageClicks',
    title: 'نقرات الإحباط',
    subtitle: 'Rage & Dead Clicks',
    descKey: 'clarity.feature.rageClicks.desc',
    desc: 'اعرف امتى الزبون اتضايق أو ضغط على حاجة مش شغالة وصلحها بسرعة.',
    color: 'border-red-100 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20',
  },
  {
    icon: <FunnelIcon className="h-6 w-6 text-blue-500" />,
    titleKey: 'clarity.feature.funnels',
    title: 'تحليل قمع المبيعات',
    subtitle: 'Funnel Analysis',
    descKey: 'clarity.feature.funnels.desc',
    desc: 'اكتشف فين الناس بتوقف قبل الشراء وحسن معدل التحويل.',
    color: 'border-blue-100 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/20',
  },
];

export const SETUP_STEPS: ClaritySetupStep[] = [
  {
    step: '1',
    titleKey: 'clarity.setup.step1.title',
    title: 'أنشئ حساب مجاني على Clarity',
    descKey: 'clarity.setup.step1.desc',
    desc: 'سجل بحسابك على Microsoft أو GitHub أو البريد الإلكتروني.',
    link: 'https://clarity.microsoft.com',
    linkTextKey: 'clarity.setup.step1.linkText',
    linkText: 'افتح Microsoft Clarity',
    color: 'bg-blue-600',
  },
  {
    step: '2',
    titleKey: 'clarity.setup.step2.title',
    title: 'أنشئ مشروع جديد وانسخ الـ ID',
    descKey: 'clarity.setup.step2.desc',
    desc: 'من Settings ثم Overview انسخ رقم المشروع القصير مثل k3a9mz1b.',
    link: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-overview',
    linkTextKey: 'clarity.setup.step2.linkText',
    linkText: 'شرح خطوات الإنشاء',
    color: 'bg-indigo-600',
  },
  {
    step: '3',
    titleKey: 'clarity.setup.step3.title',
    title: 'الصق الـ ID هنا واحفظ',
    descKey: 'clarity.setup.step3.desc',
    desc: 'بعد الحفظ سيبدأ Clarity في تتبع زوار متجرك تلقائيًا.',
    link: null,
    linkTextKey: null,
    linkText: null,
    color: 'bg-green-600',
  },
];

export const USEFUL_LINKS: ClarityUsefulLink[] = [
  { labelKey: 'clarity.link.signup', label: 'التسجيل المجاني على Clarity', url: 'https://clarity.microsoft.com' },
  { labelKey: 'clarity.link.heatmaps', label: 'شرح Heatmaps بالتفصيل', url: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-heatmap' },
  { labelKey: 'clarity.link.recordings', label: 'شرح Session Recordings', url: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/session-recordings' },
  { labelKey: 'clarity.link.projectId', label: 'كيفية إيجاد الـ Project ID', url: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-overview' },
];
