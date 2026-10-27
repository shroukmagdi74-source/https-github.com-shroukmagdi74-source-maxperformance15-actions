import React from 'react';
import { Ruler } from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';

interface FactorySizeChartCardProps {
  sizeChart: NonNullable<FactoryPortalAssignment['sizeChart']>;
}

export const FactorySizeChartCard: React.FC<FactorySizeChartCardProps> = ({
  sizeChart,
}) => {
  const methodLabel =
    sizeChart.measurementMethod === 'FLAT' ? 'فلات نصف محيط' : 'دائري محيط كامل';

  const rows = (sizeChart.rows || []).filter(
    (r) => r.source === 'FACTORY' || r.source === 'CUSTOMER',
  );

  return (
    <div className="space-y-2 pt-2 border-t border-border/50">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Ruler className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs text-foreground">
            جدول القياسات المعتمد: {sizeChart.name}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60 font-bold">
            {sizeChart.code} V{sizeChart.version}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ({sizeChart.unit} — {methodLabel})
          </span>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
          <table className="w-full text-right text-[11px]">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="p-2 font-semibold">المقاس (Size)</th>
                <th className="p-2 font-semibold">القياس (Measurement)</th>
                <th className="p-2 font-semibold text-center">
                  المقاس المطلوب ({sizeChart.unit})
                </th>
                <th className="p-2 font-semibold text-center">التفاوت المسموح ±</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/20">
                  <td className="p-2 font-mono font-bold text-foreground">
                    {row.sizeLabel}
                  </td>
                  <td className="p-2 font-medium text-foreground">
                    {row.measurementKey}
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-foreground tabular-nums">
                    {row.value} {sizeChart.unit}
                  </td>
                  <td className="p-2 text-center font-mono text-muted-foreground tabular-nums">
                    ±{row.tolerance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          لا توجد قياسات مسجلة في هذا الجدول
        </p>
      )}
    </div>
  );
};
