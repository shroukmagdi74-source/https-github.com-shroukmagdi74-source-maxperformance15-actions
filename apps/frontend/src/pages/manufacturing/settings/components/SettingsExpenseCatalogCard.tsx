import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, Archive, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import { manufacturingApi, SampleExpenseCatalogItem } from '../../manufacturingApi';

export const SettingsExpenseCatalogCard: React.FC = () => {
  const [items, setItems] = useState<SampleExpenseCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New item state
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [creating, setCreating] = useState(false);

  // Editing state (map of id -> { name, defaultAmount, isActive })
  const [editMap, setEditMap] = useState<
    Record<string, { name: string; defaultAmount: string; isActive: boolean }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await manufacturingApi.listExpenseCatalog({ includeInactive: true });
      setItems(Array.isArray(data) ? data : []);
      // Initialize editMap
      const m: Record<string, { name: string; defaultAmount: string; isActive: boolean }> = {};
      (Array.isArray(data) ? data : []).forEach((it) => {
        m[it.id] = {
          name: it.name,
          defaultAmount: String(it.defaultAmount),
          isActive: it.isActive,
        };
      });
      setEditMap(m);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في تحميل كتالوج المصاريف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('اسم المصروف مطلوب');
      return;
    }
    const amt = Number(newAmount) || 0;
    if (amt < 0) {
      setError('السعر الافتراضي يجب أن يكون رقم ≥ 0');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const created = await manufacturingApi.createExpenseCatalogItem({
        name: trimmed,
        defaultAmount: amt,
      });
      setItems((prev) => [created, ...prev]);
      setEditMap((prev) => ({
        ...prev,
        [created.id]: {
          name: created.name,
          defaultAmount: String(created.defaultAmount),
          isActive: created.isActive,
        },
      }));
      setNewName('');
      setNewAmount('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في إضافة المصروف للكتالوج');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const curr = editMap[id];
    if (!curr) return;
    const trimmed = curr.name.trim();
    if (!trimmed) {
      setError('اسم المصروف مطلوب');
      return;
    }
    const amt = Number(curr.defaultAmount) || 0;
    if (amt < 0) {
      setError('السعر الافتراضي يجب أن يكون رقم ≥ 0');
      return;
    }

    setSavingId(id);
    setError(null);
    try {
      const updated = await manufacturingApi.updateExpenseCatalogItem(id, {
        name: trimmed,
        defaultAmount: amt,
        isActive: curr.isActive,
      });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في تحديث بند المصروف');
    } finally {
      setSavingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      await manufacturingApi.archiveExpenseCatalogItem(id);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isActive: false } : it))
      );
      setEditMap((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || { name: '', defaultAmount: '0' }), isActive: false },
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في أرشفة بند المصروف');
    } finally {
      setSavingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      const updated = await manufacturingApi.updateExpenseCatalogItem(id, { isActive: true });
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isActive: true } : it))
      );
      setEditMap((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || { name: '', defaultAmount: '0' }), isActive: true },
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في استعادة بند المصروف');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border/70 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span>كتالوج المصاريف المتكررة لأوامر العينات (T07)</span>
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            تضاف مرة واحدة في الإعدادات وتظهر تلقائياً للاختيار في أوامر العينات
          </span>
          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
            title="تحديث"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add New Item Row */}
      <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
        <span className="text-xs font-semibold text-foreground">إضافة مصروف جديد للكتالوج:</span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="اسم المصروف (مثال: تطريز · شحن · معاينة)"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border/70 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="relative w-full sm:w-40">
            <input
              type="number"
              step="0.01"
              min="0"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="السعر الافتراضي"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border/70 bg-background text-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="absolute left-2.5 top-1.5 text-[10px] text-muted-foreground">ج.م</span>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-4">
            لا توجد مصاريف مضافة للكتالوج بعد. أضف أول مصروف من النموذج أعلاه.
          </p>
        )}

        {items.map((it) => {
          const edit = editMap[it.id] || {
            name: it.name,
            defaultAmount: String(it.defaultAmount),
            isActive: it.isActive,
          };
          const isSaving = savingId === it.id;

          return (
            <div
              key={it.id}
              className={`flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-lg border text-xs transition-colors ${
                edit.isActive
                  ? 'border-border/70 bg-background'
                  : 'border-border/40 bg-muted/40 opacity-70'
              }`}
            >
              {/* Name */}
              <input
                type="text"
                value={edit.name}
                onChange={(e) =>
                  setEditMap((prev) => ({
                    ...prev,
                    [it.id]: { ...(prev[it.id] || edit), name: e.target.value },
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUpdate(it.id);
                  }
                }}
                className="flex-1 w-full px-2.5 py-1 text-xs rounded border border-border/60 bg-background text-foreground font-medium"
              />

              {/* Default Amount */}
              <div className="relative w-full sm:w-36">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={edit.defaultAmount}
                  onChange={(e) =>
                    setEditMap((prev) => ({
                      ...prev,
                      [it.id]: { ...(prev[it.id] || edit), defaultAmount: e.target.value },
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUpdate(it.id);
                    }
                  }}
                  className="w-full px-2.5 py-1 text-xs rounded border border-border/60 bg-background text-foreground tabular-nums"
                />
                <span className="absolute left-2.5 top-1 text-[10px] text-muted-foreground">ج.م</span>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                  edit.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {edit.isActive ? 'مفعّل' : 'مؤرشف'}
              </span>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdate(it.id)}
                  disabled={isSaving}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1"
                  title="حفظ التعديلات"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>حفظ</span>
                </button>

                {edit.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(it.id)}
                    disabled={isSaving}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 border border-border flex items-center gap-1"
                    title="أرشفة (إخفاء من القوائم)"
                  >
                    <Archive className="w-3 h-3" />
                    <span>أرشفة</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRestore(it.id)}
                    disabled={isSaving}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1"
                    title="استعادة وتفعيل المصروف في القوائم"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>تفعيل</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
