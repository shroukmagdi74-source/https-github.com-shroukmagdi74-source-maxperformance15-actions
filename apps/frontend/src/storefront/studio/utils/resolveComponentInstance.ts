import type {
  StudioGlobalComponent,
  StudioSectionShape,
  StudioComponentInstance,
} from "../StudioTypes";

export interface ResolveOptions {
  visitedIds?: Set<string>;
  throwOnCircular?: boolean;
}

/**
 * Creates a safe, non-crashing placeholder for a deleted or missing global component master.
 */
export function createDeletedComponentPlaceholder(
  section: any,
  labelText = "مكوّن محذوف"
): any {
  return {
    ...section,
    type: "placeholder",
    isPlaceholder: true,
    isDeletedComponent: true,
    label: labelText,
    settings: {
      ...(section && typeof section === "object" ? section.settings : {}),
      title: labelText,
      content: "تم حذف المكوّن الأصلي المرتبط بهذه النسخة من مكتبة المكوّنات العامة",
      badge: "مكوّن محذوف",
      isPlaceholder: true,
      isDeletedComponent: true,
    },
  };
}

/**
 * Validates whether a component section contains a self-reference or circular reference
 * to targetComponentId (either directly or via nested children or transitive component instances).
 * Throws a descriptive error if a loop is detected.
 */
export function validateComponentHierarchy(
  targetComponentId: string,
  section: any,
  globalComponents: StudioGlobalComponent[] = [],
  visited: Set<string> = new Set<string>()
): void {
  if (!section || typeof section !== "object") return;

  const currentComponentId =
    section.componentId || (section.settings && section.settings.componentId);

  // Direct self-reference check
  if (section.type === "componentInstance" && currentComponentId === targetComponentId) {
    throw new Error(
      `حلقة تكرار ذاتية غير مسموحة: المكوّن «${targetComponentId}» يحتوي على نسخة من نفسه`
    );
  }

  // If section is a component instance referencing another component, verify transitive loop
  if (section.type === "componentInstance" && currentComponentId) {
    if (visited.has(currentComponentId)) {
      throw new Error(
        `حلقة تكرار ذاتية غير مسموحة: تم اكتشاف اعتماد دائري مع المكوّن «${currentComponentId}»`
      );
    }
    const nextVisited = new Set(visited);
    nextVisited.add(currentComponentId);

    const refMaster = globalComponents.find((c) => c.id === currentComponentId);
    if (refMaster && refMaster.section) {
      validateComponentHierarchy(targetComponentId, refMaster.section, globalComponents, nextVisited);
    }
  }

  // Check children in tree/container
  if (Array.isArray(section.children)) {
    for (const child of section.children) {
      validateComponentHierarchy(targetComponentId, child, globalComponents, new Set(visited));
    }
  }
}

/**
 * Resolves a section at render time.
 * If the section is a `componentInstance`, it reads and returns the master component's
 * latest section data from `globalComponents`, keeping instance-specific keys and identity.
 * If the master was deleted, returns a safe placeholder without throwing.
 * If a circular loop is detected, throws a clear, descriptive Error.
 */
export function resolveComponentInstance(
  section: any,
  globalComponents: StudioGlobalComponent[] = [],
  optionsOrVisited?: ResolveOptions | Set<string>
): any {
  if (!section || typeof section !== "object") {
    return section;
  }

  const visited: Set<string> =
    optionsOrVisited instanceof Set
      ? optionsOrVisited
      : optionsOrVisited?.visitedIds || new Set<string>();

  // If not a component instance, recursively resolve children if it's a container
  if (section.type !== "componentInstance") {
    if (Array.isArray(section.children)) {
      return {
        ...section,
        children: section.children.map((child: any) =>
          resolveComponentInstance(child, globalComponents, visited)
        ),
      };
    }
    return section;
  }

  const componentId =
    section.componentId || (section.settings && section.settings.componentId);

  // Missing componentId -> fallback placeholder
  if (!componentId) {
    return createDeletedComponentPlaceholder(section, "مكوّن غير معروف");
  }

  // Loop/cycle detection: if componentId is already in visited set, circular reference!
  if (visited.has(componentId)) {
    throw new Error(
      `حلقة تكرار ذاتية غير مسموحة: المكوّن «${componentId}» يحتوي على نسخة من نفسه`
    );
  }

  const master = globalComponents.find((c) => c.id === componentId);

  // Master deleted or missing -> Return placeholder safely with ZERO THROW!
  if (!master || !master.section) {
    return createDeletedComponentPlaceholder(section, "مكوّن محذوف");
  }

  const nextVisited = new Set(visited);
  nextVisited.add(componentId);

  // Clone master section so mutations don't corrupt in-memory master unintentionally
  const masterClone = JSON.parse(JSON.stringify(master.section));

  // If master itself contains nested instances or container children, resolve them
  let resolvedMaster = masterClone;
  if (masterClone.type === "componentInstance") {
    resolvedMaster = resolveComponentInstance(masterClone, globalComponents, nextVisited);
  } else if (Array.isArray(masterClone.children)) {
    resolvedMaster.children = masterClone.children.map((child: any) =>
      resolveComponentInstance(child, globalComponents, nextVisited)
    );
  }

  return {
    ...resolvedMaster,
    key: section.key || resolvedMaster.key,
    id: section.id || resolvedMaster.id,
    _instanceOf: componentId,
    _isComponentInstance: true,
  };
}

/**
 * Detaches a component instance, converting it into an independent, standalone section.
 * Subsequent modifications to the master component will NOT affect this detached section.
 */
export function detachComponentInstance(
  instanceSection: any,
  globalComponents: StudioGlobalComponent[] = []
): any {
  if (!instanceSection || typeof instanceSection !== "object") {
    return instanceSection;
  }

  if (instanceSection.type !== "componentInstance") {
    return JSON.parse(JSON.stringify(instanceSection));
  }

  const resolved = resolveComponentInstance(instanceSection, globalComponents);
  const detached = JSON.parse(JSON.stringify(resolved));

  delete detached.componentId;
  delete detached._instanceOf;
  delete detached._isComponentInstance;

  if (detached.settings && typeof detached.settings === "object") {
    delete detached.settings.componentId;
  }

  // Preserve key or assign a new unique key
  detached.key = instanceSection.key || `${detached.type || "section"}-${Date.now()}`;

  return detached;
}

/**
 * Helper to construct a clean `StudioComponentInstance` section object.
 * Contains strictly the componentId and type - NO duplication of master data.
 */
export function createComponentInstance(
  component: { id: string; name?: string },
  customKey?: string
): StudioComponentInstance {
  const instanceKey =
    customKey || `componentInstance-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    type: "componentInstance",
    key: instanceKey,
    componentId: component.id,
    label: component.name || "نسخة مكوّن عام",
    settings: {
      componentId: component.id,
    },
  };
}

/**
 * Creates a new `StudioGlobalComponent` from a section, stripping unique keys and IDs
 * and validating that no circular references exist.
 */
export function createGlobalComponent(
  name: string,
  section: any,
  options?: { existingComponents?: StudioGlobalComponent[]; customId?: string }
): StudioGlobalComponent {
  const newId =
    options?.customId ||
    `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const clean = JSON.parse(JSON.stringify(section || {}));
  delete clean.key;
  delete clean.id;

  if (Array.isArray(clean.children)) {
    const stripKeys = (children: any[]) => {
      children.forEach((c: any) => {
        delete c.key;
        delete c.id;
        if (Array.isArray(c.children)) stripKeys(c.children);
      });
    };
    stripKeys(clean.children);
  }

  // Validate hierarchy against existing components to prevent circular self-references
  validateComponentHierarchy(newId, clean, options?.existingComponents || []);

  const now = new Date().toISOString();
  return {
    id: newId,
    name: name?.trim() || clean.label || clean.settings?.title || clean.type || "مكوّن عام",
    section: clean,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Counts the number of times a component is used across pages and container children.
 */
export function countComponentUsage(
  componentId: string,
  pagesOrSections?: Record<string, { sections?: any[] } | any> | any[]
): number {
  if (!pagesOrSections || !componentId) return 0;

  let count = 0;

  const inspectSection = (sec: any) => {
    if (!sec || typeof sec !== "object") return;
    const refId = sec.componentId || (sec.settings && sec.settings.componentId);
    if (sec.type === "componentInstance" && refId === componentId) {
      count++;
    }
    if (Array.isArray(sec.children)) {
      sec.children.forEach(inspectSection);
    }
  };

  if (Array.isArray(pagesOrSections)) {
    pagesOrSections.forEach(inspectSection);
    return count;
  }

  // If map of pages (e.g. { home: { sections: [...] }, shop: { sections: [...] } })
  Object.values(pagesOrSections).forEach((pageVal: any) => {
    if (pageVal && Array.isArray(pageVal.sections)) {
      pageVal.sections.forEach(inspectSection);
    } else if (Array.isArray(pageVal)) {
      pageVal.forEach(inspectSection);
    }
  });

  return count;
}
