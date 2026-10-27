export interface StudioShortcutItem {
  id: string;
  category: "editing" | "canvas" | "navigation" | "general";
  categoryLabel: string;
  label: string;
  keys: string[];
  displayKey: string;
  description: string;
}

export const STUDIO_KEYMAP: StudioShortcutItem[] = [
  {
    id: "save",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "حفظ التعديلات",
    keys: ["ctrl", "s"],
    displayKey: "Ctrl + S",
    description: "حفظ ونشر التعديلات الحالية للمتجر",
  },
  {
    id: "undo",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "تراجع",
    keys: ["ctrl", "z"],
    displayKey: "Ctrl + Z",
    description: "التراجع عن آخر عملية تحرير",
  },
  {
    id: "redo",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "إعادة",
    keys: ["ctrl", "y"],
    displayKey: "Ctrl + Y",
    description: "إعادة تنفيذ العملية المتراجع عنها",
  },
  {
    id: "search",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "بحث واستبدال",
    keys: ["ctrl", "f"],
    displayKey: "Ctrl + F",
    description: "فتح شريط البحث والاستبدال في نصوص الصفحة",
  },
  {
    id: "copy",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "نسخ القسم",
    keys: ["ctrl", "c"],
    displayKey: "Ctrl + C",
    description: "نسخ القسم المحدد إلى الحافظة",
  },
  {
    id: "paste",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "لصق القسم",
    keys: ["ctrl", "v"],
    displayKey: "Ctrl + V",
    description: "لصق القسم المنسوخ بعد القسم الحالي",
  },
  {
    id: "delete",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "حذف المحدد",
    keys: ["delete"],
    displayKey: "Delete / Backspace",
    description: "حذف القسم أو الأقسام المحددة",
  },
  {
    id: "multi-select",
    category: "editing",
    categoryLabel: "التحرير والحفظ",
    label: "تحديد متعدد",
    keys: ["shift", "click"],
    displayKey: "Shift / Ctrl + Click",
    description: "تحديد أكثر من قسم لتطبيق عمليات جماعية",
  },
  {
    id: "zoom-in",
    category: "canvas",
    categoryLabel: "الكانفس والعرض",
    label: "تكبير الكانفس",
    keys: ["ctrl", "+"],
    displayKey: "Ctrl + +",
    description: "زيادة نسبة تكبير مساحة العمل",
  },
  {
    id: "zoom-out",
    category: "canvas",
    categoryLabel: "الكانفس والعرض",
    label: "تصغير الكانفس",
    keys: ["ctrl", "-"],
    displayKey: "Ctrl + -",
    description: "تقليل نسبة تكبير مساحة العمل",
  },
  {
    id: "zoom-reset",
    category: "canvas",
    categoryLabel: "الكانفس والعرض",
    label: "إعادة ضبط الزوم",
    keys: ["ctrl", "0"],
    displayKey: "Ctrl + 0",
    description: "إعادة نسبة التكبير إلى 100%",
  },
  {
    id: "escape",
    category: "general",
    categoryLabel: "عام والتنقل",
    label: "إلغاء / إغلاق",
    keys: ["escape"],
    displayKey: "Escape",
    description: "إغلاق النوافذ المنبثقة أو إلغاء التحديد",
  },
  {
    id: "help",
    category: "general",
    categoryLabel: "عام والتنقل",
    label: "لوحة الاختصارات",
    keys: ["?"],
    displayKey: "?",
    description: "عرض دليل اختصارات لوحة المفاتيح",
  },
];
