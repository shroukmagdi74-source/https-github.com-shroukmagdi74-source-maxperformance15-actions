import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontHeaderController } from '../storefrontHeaderTypes';
import { StorefrontSearchResults } from '../../StorefrontSearchResults';

export interface StorefrontSearchOverlayProps {
  ctrl: StorefrontHeaderController;
}

export const StorefrontSearchOverlay: React.FC<StorefrontSearchOverlayProps> = ({ ctrl }) => {
  const {
    theme,
    searchOpen,
    closeSearchOverlay,
    query,
    setQuery,
    results,
    isLoading,
    moreResultsPath,
  } = ctrl;

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="container max-w-2xl pt-20 px-4">
        <div className="relative group" dir={theme.direction}>
          <svg
            className={`absolute ${theme.direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors`}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder={
              theme.direction === 'rtl'
                ? 'ابحث عن المنتجات...'
                : 'Search products...'
            }
            className={`w-full h-14 ${theme.direction === 'rtl' ? 'pe-12 ps-12' : 'ps-12 pe-12'} bg-card border-2 border-border focus:border-primary rounded-xl text-lg outline-none transition-all shadow-xl`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearchOverlay()}
          />
          <button
            onClick={closeSearchOverlay}
            className={`absolute ${theme.direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {query.length > 2 && (
          <div className="mt-4 p-4 bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <p className="text-sm text-muted-foreground mb-4 font-medium text-start">
              {theme.direction === 'rtl'
                ? `النتائج لـ "${query}"`
                : `Results for "${query}"`}
            </p>
            <StorefrontSearchResults
              results={results}
              isLoading={isLoading}
              close={closeSearchOverlay}
            />
            <Link
              to={moreResultsPath}
              onClick={closeSearchOverlay}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:text-primary"
            >
              {theme.direction === 'rtl' ? 'عرض مزيد من النتائج' : 'More results'}
            </Link>
          </div>
        )}

        <button
          className="mt-6 mx-auto block text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={closeSearchOverlay}
        >
          {theme.direction === 'rtl' ? (
            <span>
              اضغط{' '}
              <kbd className="font-sans px-1.5 py-0.5 rounded border border-border bg-muted">
                ESC
              </kbd>{' '}
              للإغلاق
            </span>
          ) : (
            <span>
              Press{' '}
              <kbd className="font-sans px-1.5 py-0.5 rounded border border-border bg-muted">
                ESC
              </kbd>{' '}
              to close
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
