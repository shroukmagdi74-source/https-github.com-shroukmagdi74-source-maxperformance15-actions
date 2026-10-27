import React from 'react';
import { Link as LinkIcon, X } from 'lucide-react';
import type { DevTaskFormData, RelatedLink } from './types';

interface DevTaskRelatedLinksCardProps {
  formData: DevTaskFormData;
  setFormData: React.Dispatch<React.SetStateAction<DevTaskFormData>>;
  newLinkTitle: string;
  setNewLinkTitle: React.Dispatch<React.SetStateAction<string>>;
  newLinkUrl: string;
  setNewLinkUrl: React.Dispatch<React.SetStateAction<string>>;
}

export const DevTaskRelatedLinksCard: React.FC<DevTaskRelatedLinksCardProps> = ({
  formData,
  setFormData,
  newLinkTitle,
  setNewLinkTitle,
  newLinkUrl,
  setNewLinkUrl,
}) => {
  const handleAddLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        relatedLinks: [...prev.relatedLinks, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }],
      }));
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <LinkIcon className="h-4 w-4 text-primary" />
        <span>الروابط والمراجع (Related Links)</span>
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="عنوان الرابط (مثال: توثيق API)"
            value={newLinkTitle}
            onChange={e => setNewLinkTitle(e.target.value)}
            className="px-3 py-1.5 text-xs border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://..."
              value={newLinkUrl}
              onChange={e => setNewLinkUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground font-mono"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              إضافة
            </button>
          </div>
        </div>

        {formData.relatedLinks.length > 0 && (
          <ul className="space-y-1.5">
            {formData.relatedLinks.map((link, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/50 rounded-lg group text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground truncate">{link.title}</span>
                  <span className="text-[11px] text-muted-foreground font-mono truncate dir-ltr">
                    {link.url}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1"
                  aria-label="Remove link"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DevTaskRelatedLinksCard;
