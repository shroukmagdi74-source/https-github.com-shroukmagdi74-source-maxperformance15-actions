import React from 'react';

export const StarRating: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 14,
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={star <= rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={star <= rating ? 'text-yellow-500' : 'text-muted-foreground'}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export const ElessiAvatar: React.FC<{ label: string }> = ({ label }) => (
  <div
    role="img"
    aria-label={label}
    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ececec] text-[#b5b5b5]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.76 0 5-2.46 5-5.5S14.76 1 12 1 7 3.46 7 6.5 9.24 12 12 12Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
    </svg>
  </div>
);

export const ReviewSkeleton: React.FC = () => (
  <div className="rounded-[var(--radius)] border border-border bg-card p-5 animate-pulse">
    <div className="mb-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-2.5 w-16 rounded bg-muted" />
      </div>
    </div>
    <div className="space-y-1.5">
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-4/5 rounded bg-muted" />
    </div>
  </div>
);
