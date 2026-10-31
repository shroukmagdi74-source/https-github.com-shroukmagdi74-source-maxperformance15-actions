import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Layers, DollarSign, Package } from 'lucide-react';
import { BomComponentNode } from '../../manufacturingApi';

interface BomComponentsTreeProps {
  nodes: BomComponentNode[];
  bomTotal: number;
  warnings?: string[];
}

interface TreeNodeProps {
  node: BomComponentNode;
  level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isInclusive = node.pricingMode === 'INCLUSIVE';
  const price = Number(node.totalPrice || 0);
  const branchTotal = Number(node.nodeTotal ?? price);

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
          level === 0
            ? 'bg-card border-border/80 shadow-xs mb-1.5'
            : 'bg-muted/30 border-border/50 my-1'
        }`}
        style={{ marginInlineStart: `${level * 20}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition shrink-0"
              title={isOpen ? 'طي الفرع' : 'توسيع الفرع'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 shrink-0">
              •
            </span>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground truncate">
                {node.rawMaterialName || node.rawMaterialId}
              </span>

              {/* Mode badge */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isInclusive
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40'
                }`}
              >
                {isInclusive ? 'شامل' : 'إضافي'}
              </span>

              {hasChildren && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{node.children!.length} أبناء</span>
                </span>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
              <span>
                {node.consumptionPerUnit} {node.consumptionUnit || node.unit}
              </span>
              {node.scrapRate > 0 && <span>(هدر: {node.scrapRate}%)</span>}
              <span>• سعر البند: {price.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>

        {/* Branch / Node Total */}
        <div className="text-left shrink-0 ps-3">
          <div className="text-xs font-bold font-mono text-foreground">
            {branchTotal.toFixed(2)} ج.م
          </div>
          <div className="text-[10px] text-muted-foreground">
            {hasChildren ? 'إجمالي الفرع' : 'إجمالي البند'}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="flex flex-col border-s-2 border-border/40 ms-3 ps-1">
          {node.children!.map((child, idx) => (
            <TreeNode key={child.id || child.clientRef || idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const BomComponentsTree: React.FC<BomComponentsTreeProps> = ({
  nodes,
  bomTotal,
  warnings = [],
}) => {
  return (
    <div className="space-y-3" dir="rtl">
      {/* Header with BOM Total */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">إجمالي القائمة (BOM Total)</div>
            <div className="text-[11px] text-muted-foreground">
              محسوب وفق هيكل الشجرة التجميعي ووضع التسعير لكل مرحلة
            </div>
          </div>
        </div>
        <div className="text-left">
          <span className="font-mono font-bold text-base text-primary">
            {Number(bomTotal || 0).toFixed(2)} ج.م
          </span>
        </div>
      </div>

      {/* Warnings yellow box */}
      {warnings && warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>تنبيهات شجرة المكونات:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 ps-1 text-[11px]">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tree Nodes List */}
      <div className="space-y-1">
        {(!nodes || nodes.length === 0) ? (
          <div className="p-6 text-center text-muted-foreground text-xs border border-dashed rounded-xl">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <span>لا توجد مكونات مسجلة في شجرة الـ BOM</span>
          </div>
        ) : (
          nodes.map((node, idx) => (
            <TreeNode key={node.id || node.clientRef || idx} node={node} level={0} />
          ))
        )}
      </div>
    </div>
  );
};

export default BomComponentsTree;
