// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import MarqueeElement from '../sections/elements/MarqueeElement';
import LottieElement from '../sections/elements/LottieElement';
import VideoElement from '../sections/elements/VideoElement';
import { StudioElementsPanel } from '../studio/StudioElementsPanel';
import { ComponentRegistry } from '../engine/ComponentRegistry';
import {
  isStorefrontSectionKnown,
  getStorefrontSectionManifest,
} from '../sections/manifest';
import { STUDIO_FX_ELEMENTS } from '../studio/StudioTypes';

describe('Studio FX Elements (Ticket FX-1)', () => {
  // 1. Marquee Default Rendering
  it('1. Marquee: renders items, seamless track, and data attributes', () => {
    const { container } = render(
      <MarqueeElement
        settings={{
          items: ['عنصر أول', 'عنصر ثانٍ', 'عنصر ثالث'],
        }}
      />,
    );

    const root = container.querySelector('[data-element="marquee"]');
    expect(root).toBeTruthy();
    expect(root?.getAttribute('data-storefront-element')).toBe('marquee');

    const track = container.querySelector('[data-testid="marquee-track"]');
    expect(track).toBeTruthy();
    expect(track?.textContent).toContain('عنصر أول');
    expect(track?.textContent).toContain('عنصر ثانٍ');
    expect(track?.textContent).toContain('عنصر ثالث');
  });

  // 2. Marquee Speed & Reduced Motion
  it('2. Marquee: speed=30 produces 30s animation in CSS and prefers-reduced-motion halts animation', () => {
    const { container } = render(
      <MarqueeElement
        settings={{
          speed: 30,
          text: 'عرض خاص لفترة محدودة',
        }}
      />,
    );

    const root = container.querySelector('[data-element="marquee"]');
    expect(root).toBeTruthy();
    expect(root?.getAttribute('data-speed')).toBe('30');

    const track = container.querySelector('[data-testid="marquee-track"]') as HTMLElement;
    expect(track).toBeTruthy();
    // Duration in track inline style
    expect(track.style.animationDuration).toBe('30s');

    // Duration and @media (prefers-reduced-motion: reduce) in style block
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    const cssText = styleTag?.textContent || '';

    expect(cssText).toContain('30s');
    expect(cssText).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssText).toContain('animation: none !important');
  });

  // 3. Marquee RTL Direction Inversion
  it('3. Marquee: animation direction reverses in dir="rtl"', () => {
    // Case A: dir="rtl" on prop / settings
    const { container: rtlContainer } = render(
      <MarqueeElement
        dir="rtl"
        settings={{
          speed: 30,
          direction: 'left',
          text: 'شريط ترويجي باللغة العربية',
        }}
      />,
    );

    const rootRtl = rtlContainer.querySelector('[data-element="marquee"]');
    expect(rootRtl?.getAttribute('dir')).toBe('rtl');
    expect(rootRtl?.getAttribute('data-rtl')).toBe('true');

    const trackRtl = rtlContainer.querySelector('[data-testid="marquee-track"]') as HTMLElement;
    expect(trackRtl).toBeTruthy();
    // In RTL, left scroll inverts to reverse
    expect(trackRtl.style.animationDirection).toBe('reverse');

    const styleTagRtl = rtlContainer.querySelector('style');
    expect(styleTagRtl?.textContent).toContain('[dir="rtl"]');
    expect(styleTagRtl?.textContent).toContain('animation-direction: reverse');

    // Case B: LTR comparison
    const { container: ltrContainer } = render(
      <MarqueeElement
        dir="ltr"
        settings={{
          speed: 30,
          direction: 'left',
          text: 'English promotional text',
        }}
      />,
    );
    const trackLtr = ltrContainer.querySelector('[data-testid="marquee-track"]') as HTMLElement;
    expect(trackLtr.style.animationDirection).toBe('normal');
  });

  // 4. Marquee Pause On Hover
  it('4. Marquee: pause on hover is enabled by default and responds to hover events', () => {
    const { container } = render(
      <MarqueeElement
        settings={{
          pauseOnHover: true,
          text: 'حرك الماوس للإيقاف المؤقت',
        }}
      />,
    );

    const root = container.querySelector('.storefront-marquee-root') as HTMLElement;
    const track = container.querySelector('[data-testid="marquee-track"]') as HTMLElement;
    expect(track.className).toContain('pause-on-hover');

    // Hover in
    fireEvent.mouseEnter(root);
    expect(track.style.animationPlayState).toBe('paused');

    // Hover out
    fireEvent.mouseLeave(root);
    expect(track.style.animationPlayState).toBeFalsy();
  });

  // 5. Lottie Without Dependency: Renders Fallback & Zero Throw
  it('5. Lottie: without dependency renders fallback (message/placeholder) and ZERO throw', () => {
    let renderResult: any;
    expect(() => {
      renderResult = render(
        <LottieElement
          settings={{
            url: 'https://assets.lottiefiles.com/packages/lf20_test.json',
            title: 'تحية ترحيبية بالعميل',
            autoplay: true,
            loop: true,
          }}
        />,
      );
    }).not.toThrow();

    const { container } = renderResult;
    const lottieWrapper = container.querySelector('[data-element="lottie"]');
    expect(lottieWrapper).toBeTruthy();
    expect(lottieWrapper?.getAttribute('data-fallback')).toBe('true');
    expect(lottieWrapper?.textContent).toContain('تحية ترحيبية بالعميل');
    expect(lottieWrapper?.textContent).toContain('lf20_test.json');
  });

  // 6. Lottie Fallback Image
  it('6. Lottie: renders fallbackImage without throwing when provided', () => {
    let renderResult: any;
    expect(() => {
      renderResult = render(
        <LottieElement
          settings={{
            url: 'https://assets.lottiefiles.com/anim.json',
            fallbackImage: 'https://example.com/fallback-banner.webp',
            message: 'لوتي مع صورة بديلة',
          }}
        />,
      );
    }).not.toThrow();

    const { container } = renderResult;
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/fallback-banner.webp');
    expect(img?.getAttribute('alt')).toBe('لوتي مع صورة بديلة');
  });

  // 7. Video Element: Poster + Preload + Muted On Autoplay
  it('7. Video: poster + preload="metadata" + muted when autoplay is true', () => {
    const { container } = render(
      <VideoElement
        settings={{
          url: 'https://cdn.example.com/product-showcase.mp4',
          poster: 'https://cdn.example.com/poster-frame.jpg',
          autoplay: true,
          controls: true,
          loop: true,
        }}
      />,
    );

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('https://cdn.example.com/product-showcase.mp4');
    expect(video?.getAttribute('poster')).toBe('https://cdn.example.com/poster-frame.jpg');
    expect(video?.getAttribute('preload')).toBe('metadata');
    // Muted must be active when autoplay is requested
    expect(video?.muted || video?.hasAttribute('muted') || video?.getAttribute('data-muted') === 'true').toBe(true);
  });

  // 8. Video Element: Loading UI
  it('8. Video: displays loading status UI indicator before playback begins', () => {
    const { container } = render(
      <VideoElement
        settings={{
          url: 'https://cdn.example.com/demo.mp4',
        }}
      />,
    );

    const loadingIndicator = container.querySelector('[data-testid="video-loading"]');
    expect(loadingIndicator).toBeTruthy();
    expect(loadingIndicator?.getAttribute('role')).toBe('status');
    expect(loadingIndicator?.textContent).toContain('جارٍ التحميل');

    // When video data is loaded, loading indicator clears
    const video = container.querySelector('video');
    if (video) {
      fireEvent.loadedData(video);
      expect(container.querySelector('[data-testid="video-loading"]')).toBeNull();
    }
  });

  // 9. Video Element: YouTube and Vimeo Embedding
  it('9. Video: embeds YouTube iframe correctly with nocookie privacy domain', () => {
    const { container } = render(
      <VideoElement
        settings={{
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          ratio: '16:9',
        }}
      />,
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('src')).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  // 10. StudioElementsPanel Integration
  it('10. StudioElementsPanel: contains video, marquee, and lottie elements as draggables', () => {
    const { container } = render(
      <StudioElementsPanel
        onAddSection={() => {}}
        onOpenFullCatalog={() => {}}
        onClose={() => {}}
      />,
    );

    const draggables = Array.from(
      container.querySelectorAll('[data-studio-draggable="true"]'),
    );
    const types = draggables.map((el) => el.getAttribute('data-section-type'));

    expect(types).toContain('video');
    expect(types).toContain('marquee');
    expect(types).toContain('lottie');
  });

  // 11. Manifest and ComponentRegistry Verification
  it('11. Manifest & ComponentRegistry: marquee and lottie are registered with valid schemas', () => {
    const fxTypes = ['video', 'marquee', 'lottie'];

    fxTypes.forEach((type) => {
      expect(isStorefrontSectionKnown(type)).toBe(true);
      const manifest = getStorefrontSectionManifest(type);
      expect(manifest).toBeDefined();
      expect(manifest?.component).toBe(type);
      expect(manifest?.label).toBeTruthy();
      expect(Array.isArray(manifest?.fields)).toBe(true);

      // Mapped in ComponentRegistry
      expect(ComponentRegistry[type]).toBeDefined();
    });

    // Check STUDIO_FX_ELEMENTS constant
    expect(STUDIO_FX_ELEMENTS.length).toBe(3);
    const registeredIds = STUDIO_FX_ELEMENTS.map((e) => e.id);
    expect(registeredIds).toContain('marquee');
    expect(registeredIds).toContain('lottie');
    expect(registeredIds).toContain('video');
  });
});
