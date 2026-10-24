import React from "react";
import { StorefrontSectionConfig } from "../../types/theme.types";
import { SectionNode, ContainerSettings, StudioDeviceMode } from "../../studio/StudioTypes";
import { normalizeSectionNode, isContainerNode, resolveContainerSettings } from "./treeUtils";
import type { RenderSectionFrameArgs } from "../PageComposer";

export interface TreeRendererProps {
  nodes: Array<string | StorefrontSectionConfig | SectionNode>;
  renderLeafSection: (
    node: string | StorefrontSectionConfig | SectionNode,
    index: number,
    parentKey?: string
  ) => React.ReactNode;
  renderSectionFrame?: (args: RenderSectionFrameArgs) => React.ReactNode;
  depth?: number;
  parentKey?: string;
  isEditor?: boolean;
  deviceMode?: StudioDeviceMode;
}

export function formatSpacingValue(val: unknown): string | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number") return `${val}px`;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return `${trimmed}px`;
    }
    return trimmed;
  }
  return undefined;
}

export function resolveSpacingValue(
  rawSettings: Record<string, any>,
  prop: string,
  deviceMode: StudioDeviceMode | "desktop" | "tablet" | "mobile" = "desktop"
): any {
  let val = rawSettings[prop];
  if (prop.startsWith("padding") && val === undefined) {
    val = rawSettings.padding;
  }
  if (prop.startsWith("margin") && val === undefined) {
    val = rawSettings.margin;
  }

  const responsive = rawSettings.responsive;
  if (responsive && typeof responsive === "object") {
    if (deviceMode === "tablet" || deviceMode === "mobile") {
      const tab = responsive.tablet;
      if (tab && typeof tab === "object" && tab[prop] !== undefined) {
        val = tab[prop];
      }
    }
    if (deviceMode === "mobile") {
      const mob = responsive.mobile;
      if (mob && typeof mob === "object" && mob[prop] !== undefined) {
        val = mob[prop];
      }
    }
  }

  return val;
}

export const TreeRenderer: React.FC<TreeRendererProps> = ({
  nodes,
  renderLeafSection,
  renderSectionFrame,
  depth = 0,
  parentKey,
  isEditor = false,
  deviceMode,
}) => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  return (
    <>
      {nodes.map((rawNode, index) => {
        const node = normalizeSectionNode(rawNode as any, index, parentKey);
        const nodeKey = node.key || `node-${depth}-${index}`;

        // Container Node Rendering
        if (isContainerNode(node)) {
          const rawSettings = (node.settings || {}) as ContainerSettings;
          const activeDeviceMode =
            deviceMode ||
            (typeof window !== "undefined" && window.innerWidth < 640
              ? "mobile"
              : typeof window !== "undefined" && window.innerWidth < 1024
              ? "tablet"
              : "desktop");
          const settings = resolveContainerSettings(rawSettings, activeDeviceMode);

          const isGrid = Boolean(settings.columns && settings.columns > 1);
          const direction = isGrid ? undefined : (settings.direction === "row" ? "row" : "column");
          const isRow = !isGrid && direction === "row";
          const gapVal = typeof settings.gap === "number" ? `${settings.gap}px` : settings.gap || "12px";

          const pt = resolveSpacingValue(rawSettings, "paddingTop", activeDeviceMode);
          const pb = resolveSpacingValue(rawSettings, "paddingBottom", activeDeviceMode);
          const pl = resolveSpacingValue(rawSettings, "paddingLeft", activeDeviceMode);
          const pr = resolveSpacingValue(rawSettings, "paddingRight", activeDeviceMode);

          const mt = resolveSpacingValue(rawSettings, "marginTop", activeDeviceMode);
          const mb = resolveSpacingValue(rawSettings, "marginBottom", activeDeviceMode);
          const mr = resolveSpacingValue(rawSettings, "marginRight", activeDeviceMode);
          const ml = resolveSpacingValue(rawSettings, "marginLeft", activeDeviceMode);

          const wrapperStyle: React.CSSProperties = {
            marginTop: formatSpacingValue(mt),
            marginRight: formatSpacingValue(mr),
            marginBottom: formatSpacingValue(mb),
            marginLeft: formatSpacingValue(ml),
            width: "100%",
          };

          const containerStyle: React.CSSProperties = {
            display: isGrid ? "grid" : "flex",
            flexDirection: isGrid ? undefined : isRow ? "row" : "column",
            flexWrap: settings.wrap ? "wrap" : "nowrap",
            gridTemplateColumns: isGrid ? `repeat(${settings.columns}, minmax(0, 1fr))` : undefined,
            gap: gapVal,
            alignItems:
              settings.align === "start"
                ? "flex-start"
                : settings.align === "end"
                ? "flex-end"
                : settings.align === "center"
                ? "center"
                : "stretch",
            paddingTop: formatSpacingValue(pt),
            paddingBottom: formatSpacingValue(pb),
            paddingLeft: formatSpacingValue(pl),
            paddingRight: formatSpacingValue(pr),
            borderRadius:
              (settings as any).borderRadius !== undefined
                ? (typeof (settings as any).borderRadius === "number" ? `${(settings as any).borderRadius}px` : (settings as any).borderRadius)
                : undefined,
            fontSize:
              (settings as any).fontSize !== undefined
                ? (typeof (settings as any).fontSize === "number" ? `${(settings as any).fontSize}px` : (settings as any).fontSize)
                : undefined,
            textAlign:
              (settings as any).contentAlign === "center"
                ? "center"
                : (settings as any).contentAlign === "start"
                ? "start"
                : (settings as any).textAlign || undefined,
            width: "100%",
          };

          const childrenList = Array.isArray(node.children) ? node.children : [];
          const hasChildren = childrenList.length > 0;

          // Responsive CSS for dynamic window resizing in live storefront
          let responsiveCss: string | null = null;
          if (rawSettings.responsive?.mobile || rawSettings.responsive?.tablet) {
            const rules: string[] = [];
            if (rawSettings.responsive?.tablet) {
              const tab = resolveContainerSettings(rawSettings, "tablet");
              const tabIsGrid = Boolean(tab.columns && tab.columns > 1);
              const tabGap = typeof tab.gap === "number" ? `${tab.gap}px` : tab.gap;

              const tabPt = resolveSpacingValue(rawSettings, "paddingTop", "tablet");
              const tabPb = resolveSpacingValue(rawSettings, "paddingBottom", "tablet");
              const tabPl = resolveSpacingValue(rawSettings, "paddingLeft", "tablet");
              const tabPr = resolveSpacingValue(rawSettings, "paddingRight", "tablet");

              const tabMt = resolveSpacingValue(rawSettings, "marginTop", "tablet");
              const tabMb = resolveSpacingValue(rawSettings, "marginBottom", "tablet");
              const tabMr = resolveSpacingValue(rawSettings, "marginRight", "tablet");
              const tabMl = resolveSpacingValue(rawSettings, "marginLeft", "tablet");

              rules.push(`
                @media (min-width: 640px) and (max-width: 1023.98px) {
                  [data-container-key="${nodeKey}"] {
                    ${tabIsGrid ? `display: grid !important; grid-template-columns: repeat(${tab.columns}, minmax(0, 1fr)) !important;` : `display: flex !important; flex-direction: ${tab.direction === "row" ? "row" : "column"} !important;`}
                    ${tab.wrap !== undefined ? `flex-wrap: ${tab.wrap ? "wrap" : "nowrap"} !important;` : ""}
                    ${tabGap ? `gap: ${tabGap} !important;` : ""}
                    ${tab.align ? `align-items: ${tab.align === "start" ? "flex-start" : tab.align === "end" ? "flex-end" : tab.align === "center" ? "center" : "stretch"} !important;` : ""}
                    ${tabPt !== undefined ? `padding-top: ${formatSpacingValue(tabPt)} !important;` : ""}
                    ${tabPb !== undefined ? `padding-bottom: ${formatSpacingValue(tabPb)} !important;` : ""}
                    ${tabPl !== undefined ? `padding-left: ${formatSpacingValue(tabPl)} !important;` : ""}
                    ${tabPr !== undefined ? `padding-right: ${formatSpacingValue(tabPr)} !important;` : ""}
                    ${(tab as any).borderRadius !== undefined ? `border-radius: ${typeof (tab as any).borderRadius === "number" ? `${(tab as any).borderRadius}px` : (tab as any).borderRadius} !important;` : ""}
                    ${(tab as any).fontSize !== undefined ? `font-size: ${typeof (tab as any).fontSize === "number" ? `${(tab as any).fontSize}px` : (tab as any).fontSize} !important;` : ""}
                    ${(tab as any).contentAlign ? `text-align: ${(tab as any).contentAlign === "center" ? "center" : "start"} !important;` : ""}
                  }
                  [data-wrapper-key="${nodeKey}"] {
                    ${tabMt !== undefined ? `margin-top: ${formatSpacingValue(tabMt)} !important;` : ""}
                    ${tabMr !== undefined ? `margin-right: ${formatSpacingValue(tabMr)} !important;` : ""}
                    ${tabMb !== undefined ? `margin-bottom: ${formatSpacingValue(tabMb)} !important;` : ""}
                    ${tabMl !== undefined ? `margin-left: ${formatSpacingValue(tabMl)} !important;` : ""}
                  }
                }
              `);
            }
            if (rawSettings.responsive?.mobile) {
              const mob = resolveContainerSettings(rawSettings, "mobile");
              const mobIsGrid = Boolean(mob.columns && mob.columns > 1);
              const mobGap = typeof mob.gap === "number" ? `${mob.gap}px` : mob.gap;

              const mobPt = resolveSpacingValue(rawSettings, "paddingTop", "mobile");
              const mobPb = resolveSpacingValue(rawSettings, "paddingBottom", "mobile");
              const mobPl = resolveSpacingValue(rawSettings, "paddingLeft", "mobile");
              const mobPr = resolveSpacingValue(rawSettings, "paddingRight", "mobile");

              const mobMt = resolveSpacingValue(rawSettings, "marginTop", "mobile");
              const mobMb = resolveSpacingValue(rawSettings, "marginBottom", "mobile");
              const mobMr = resolveSpacingValue(rawSettings, "marginRight", "mobile");
              const mobMl = resolveSpacingValue(rawSettings, "marginLeft", "mobile");

              rules.push(`
                @media (max-width: 639.98px) {
                  [data-container-key="${nodeKey}"] {
                    ${mobIsGrid ? `display: grid !important; grid-template-columns: repeat(${mob.columns}, minmax(0, 1fr)) !important;` : `display: flex !important; flex-direction: ${mob.direction === "row" ? "row" : "column"} !important;`}
                    ${mob.wrap !== undefined ? `flex-wrap: ${mob.wrap ? "wrap" : "nowrap"} !important;` : ""}
                    ${mobGap ? `gap: ${mobGap} !important;` : ""}
                    ${mob.align ? `align-items: ${mob.align === "start" ? "flex-start" : mob.align === "end" ? "flex-end" : mob.align === "center" ? "center" : "stretch"} !important;` : ""}
                    ${mobPt !== undefined ? `padding-top: ${formatSpacingValue(mobPt)} !important;` : ""}
                    ${mobPb !== undefined ? `padding-bottom: ${formatSpacingValue(mobPb)} !important;` : ""}
                    ${mobPl !== undefined ? `padding-left: ${formatSpacingValue(mobPl)} !important;` : ""}
                    ${mobPr !== undefined ? `padding-right: ${formatSpacingValue(mobPr)} !important;` : ""}
                    ${(mob as any).borderRadius !== undefined ? `border-radius: ${typeof (mob as any).borderRadius === "number" ? `${(mob as any).borderRadius}px` : (mob as any).borderRadius} !important;` : ""}
                    ${(mob as any).fontSize !== undefined ? `font-size: ${typeof (mob as any).fontSize === "number" ? `${(mob as any).fontSize}px` : (mob as any).fontSize} !important;` : ""}
                    ${(mob as any).contentAlign ? `text-align: ${(mob as any).contentAlign === "center" ? "center" : "start"} !important;` : ""}
                  }
                  [data-wrapper-key="${nodeKey}"] {
                    ${mobMt !== undefined ? `margin-top: ${formatSpacingValue(mobMt)} !important;` : ""}
                    ${mobMr !== undefined ? `margin-right: ${formatSpacingValue(mobMr)} !important;` : ""}
                    ${mobMb !== undefined ? `margin-bottom: ${formatSpacingValue(mobMb)} !important;` : ""}
                    ${mobMl !== undefined ? `margin-left: ${formatSpacingValue(mobMl)} !important;` : ""}
                  }
                }
              `);
            }
            responsiveCss = rules.join("\n");
          }

          const innerContainer = (
            <div
              data-storefront-container="true"
              data-container-key={nodeKey}
              data-direction={settings.direction}
              data-columns={settings.columns || 1}
              data-align={settings.align}
              data-wrap={settings.wrap ? "true" : "false"}
              className="storefront-container relative w-full"
              style={containerStyle}
            >
              {responsiveCss && (
                <style
                  data-container-style={nodeKey}
                  dangerouslySetInnerHTML={{ __html: responsiveCss }}
                />
              )}
              {hasChildren ? (
                <TreeRenderer
                  nodes={childrenList}
                  renderLeafSection={renderLeafSection}
                  renderSectionFrame={renderSectionFrame}
                  depth={depth + 1}
                  parentKey={nodeKey}
                  isEditor={isEditor}
                  deviceMode={deviceMode}
                />
              ) : isEditor ? (
                <div
                  data-studio-empty-container="true"
                  className="flex min-h-[72px] w-full items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs font-semibold text-primary/70"
                >
                  حاوية فارغة — اسحب الأقسام هنا للإضافة
                </div>
              ) : null}
            </div>
          );

          const containerElement = (
            <div
              key={nodeKey}
              data-storefront-wrapper="true"
              data-section-wrapper="true"
              data-wrapper-key={nodeKey}
              className="storefront-section-wrapper relative w-full"
              style={wrapperStyle}
            >
              {innerContainer}
            </div>
          );

          if (!renderSectionFrame) {
            return containerElement;
          }

          return (
            <React.Fragment key={nodeKey}>
              {renderSectionFrame({
                element: containerElement,
                index,
                sectionEntry: node as unknown as StorefrontSectionConfig,
                sectionId: "container",
                componentKey: "container",
              })}
            </React.Fragment>
          );
        }

        // Leaf Section Rendering
        const leafElement = renderLeafSection(node as any, index, parentKey);

        const leafRawSettings = (node.settings || {}) as Record<string, any>;
        const activeDeviceMode =
          deviceMode ||
          (typeof window !== "undefined" && window.innerWidth < 640
            ? "mobile"
            : typeof window !== "undefined" && window.innerWidth < 1024
            ? "tablet"
            : "desktop");

        const leafPt = resolveSpacingValue(leafRawSettings, "paddingTop", activeDeviceMode);
        const leafPb = resolveSpacingValue(leafRawSettings, "paddingBottom", activeDeviceMode);
        const leafPl = resolveSpacingValue(leafRawSettings, "paddingLeft", activeDeviceMode);
        const leafPr = resolveSpacingValue(leafRawSettings, "paddingRight", activeDeviceMode);

        const leafMt = resolveSpacingValue(leafRawSettings, "marginTop", activeDeviceMode);
        const leafMb = resolveSpacingValue(leafRawSettings, "marginBottom", activeDeviceMode);
        const leafMr = resolveSpacingValue(leafRawSettings, "marginRight", activeDeviceMode);
        const leafMl = resolveSpacingValue(leafRawSettings, "marginLeft", activeDeviceMode);

        const hasLeafSpacing =
          leafPt !== undefined ||
          leafPb !== undefined ||
          leafPl !== undefined ||
          leafPr !== undefined ||
          leafMt !== undefined ||
          leafMb !== undefined ||
          leafMr !== undefined ||
          leafMl !== undefined;

        if (!renderSectionFrame && hasLeafSpacing) {
          const leafWrapperStyle: React.CSSProperties = {
            marginTop: formatSpacingValue(leafMt),
            marginRight: formatSpacingValue(leafMr),
            marginBottom: formatSpacingValue(leafMb),
            marginLeft: formatSpacingValue(leafMl),
            width: "100%",
          };

          const leafContentStyle: React.CSSProperties = {
            paddingTop: formatSpacingValue(leafPt),
            paddingRight: formatSpacingValue(leafPr),
            paddingBottom: formatSpacingValue(leafPb),
            paddingLeft: formatSpacingValue(leafPl),
            width: "100%",
          };

          return (
            <div
              key={nodeKey}
              data-storefront-wrapper="true"
              data-section-wrapper="true"
              data-wrapper-key={nodeKey}
              className="storefront-section-wrapper relative w-full"
              style={leafWrapperStyle}
            >
              <div
                data-storefront-section-content="true"
                data-section-key={nodeKey}
                style={leafContentStyle}
              >
                {leafElement}
              </div>
            </div>
          );
        }

        return (
          <React.Fragment key={nodeKey}>
            {leafElement}
          </React.Fragment>
        );
      })}
    </>
  );
};
