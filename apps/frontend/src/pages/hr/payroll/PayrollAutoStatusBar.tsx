import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { PayrollAutoStatus } from './types';

interface PayrollAutoStatusBarProps {
  autoStatus: PayrollAutoStatus;
}

export const PayrollAutoStatusBar: React.FC<PayrollAutoStatusBarProps> = ({ autoStatus }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>نظام الأتمتة:</span>
          <span className="font-bold text-white">{autoStatus.autoDeductionEnabled ? 'مفعّل تلقائياً' : 'معطل'}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>يوم الصرف الشهري:</span>
          <span className="font-semibold text-white">يوم {autoStatus.payrollDay}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>معامل الغياب:</span>
          <span className="font-semibold text-white">{autoStatus.absencePenaltyRate}x</span>
          <span className="text-slate-400">({autoStatus.workingHoursPerDay}س/يوم)</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-emerald-950/60 border-emerald-500/30 text-emerald-300 text-[11px] tabular-nums">
          {autoStatus.stats?.attendanceCount || 0} سجل حضور مسجل
        </Badge>
        <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-[11px] tabular-nums">
          {autoStatus.stats?.draftCount || 0} مسودة جاهزة
        </Badge>
      </div>
    </div>
  );
};
