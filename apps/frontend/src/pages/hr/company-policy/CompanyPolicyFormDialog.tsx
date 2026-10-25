import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { categories } from "./helpers";

interface CompanyPolicyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onIsActiveChange: (val: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const CompanyPolicyFormDialog: React.FC<CompanyPolicyFormDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditing,
  title,
  content,
  category,
  isActive,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onIsActiveChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تعديل السياسة" : "إضافة سياسة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان السياسة *</Label>
              <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="مثال: سياسة العمل عن بُعد"
              />
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>محتوى السياسة *</Label>
            <div className="h-96 mb-12">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={onContentChange}
                className="h-80"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "clean"],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                  ],
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="policy-active-toggle"
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="policy-active-toggle">
              {isEditing ? "تفعيل السياسة" : "تفعيل السياسة (نشر مباشر)"}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={onSubmit}>
            {isEditing ? "حفظ التغييرات" : "حفظ السياسة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
