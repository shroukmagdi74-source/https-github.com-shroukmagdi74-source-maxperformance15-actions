/**
 * @file SidebarPreferences.tsx
 * @description صفحة تخصيص عناصر القائمة الجانبية (إخفاء / إظهار وترتيب عناصر المستوى الأول)
 */

import React, { useEffect, useMemo, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getSidebarConfig } from "../../config/sidebar";
import { useAuth } from "../../hooks/useAuthSimple";
import { apiClient } from "../../services/apiClient";

interface SidebarItemEntry {
  id: string;
  label: string;
  sectionTitle: string;
}

const SidebarPreferences: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [hidden, setHidden] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  // استخراج جميع عناصر المستوى الأول المتاحة
  const defaultItems = useMemo<SidebarItemEntry[]>(() => {
    try {
      const dummyT = (key: string) => key;
      const sections = getSidebarConfig(dummyT, user ?? {});
      const list: SidebarItemEntry[] = [];
      const seen = new Set<string>();

      for (const section of sections) {
        for (const item of section.items || []) {
          const id = item.id || item.to;
          if (id && !seen.has(id)) {
            seen.add(id);
            list.push({
              id,
              label: item.label || id,
              sectionTitle: section.title || ""
            });
          }
        }
      }
      return list;
    } catch {
      return [];
    }
  }, [user]);

  // جلب التفضيلات الحالية من الباك إند
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient
      .get<{ success?: boolean; data?: { hidden?: string[]; order?: string[] } }>("/company/sidebar-preferences")
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data || res?.data;
        if (data) {
          if (Array.isArray(data.hidden)) {
            setHidden(data.hidden);
          }
          if (Array.isArray(data.order)) {
            setOrder(data.order);
          }
        }
      })
      .catch((err) => {
        console.warn("[SIDEBAR-PREFERENCES] تعذر جلب التفضيلات:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ترتيب العناصر وفق مصفوفة order
  const orderedItems = useMemo<SidebarItemEntry[]>(() => {
    if (!order.length) return defaultItems;
    const orderMap = new Map(order.map((id, index) => [id, index]));

    return [...defaultItems].sort((a, b) => {
      const aPos = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
      const bPos = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
      return aPos - bPos;
    });
  }, [defaultItems, order]);

  // تبديل حالة إظهار / إخفاء عنصر
  const toggleVisibility = (id: string) => {
    setHidden((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // تحريك عنصر للأعلى
  const moveUp = (index: number) => {
    if (index === 0) return;
    const currentList = [...orderedItems];
    const temp = currentList[index - 1];
    currentList[index - 1] = currentList[index];
    currentList[index] = temp;
    setOrder(currentList.map((item) => item.id));
  };

  // تحريك عنصر للأسفل
  const moveDown = (index: number) => {
    if (index >= orderedItems.length - 1) return;
    const currentList = [...orderedItems];
    const temp = currentList[index + 1];
    currentList[index + 1] = currentList[index];
    currentList[index] = temp;
    setOrder(currentList.map((item) => item.id));
  };

  // حفظ التفضيلات
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const currentOrder = order.length ? order : orderedItems.map((item) => item.id);
      await apiClient.put("/company/sidebar-preferences", {
        hidden,
        order: currentOrder
      });

      setMessage({ type: "success", text: "تم حفظ تفضيلات القائمة الجانبية بنجاح" });
    } catch (error: any) {
      console.error("[SIDEBAR-PREFERENCES] خطأ في الحفظ:", error);
      setMessage({
        type: "error",
        text: error?.response?.data?.error || "فشل في حفظ التفضيلات، يرجى المحاولة لاحقاً"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              تخصيص القائمة الجانبية
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              تحكّم في إظهار أو إخفاء عناصر القائمة وترتيب ظهورها لكل مستخدمي الشركة.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4" />
                حفظ التغييرات
              </span>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">جاري تحميل عناصر القائمة...</p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-gray-100 dark:divide-gray-700/60">
            {orderedItems.map((item, index) => {
              const isHidden = hidden.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={!isHidden}
                      onChange={() => toggleVisibility(item.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div>
                      <span className={`text-sm font-medium ${isHidden ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}>
                        {item.label}
                      </span>
                      {item.sectionTitle && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 block">
                          {item.sectionTitle}
                        </span>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      aria-label="تحريك لأعلى"
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === orderedItems.length - 1}
                      aria-label="تحريك لأسفل"
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarPreferences;
