import React, { useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuthSimple";
import { apiClient } from "../../services/apiClient";
import { handleInsufficientWalletBalance } from "../../utils/marketplaceWalletHelper";
import { createMasterBlueprint } from "./masterBlueprint";
import { TOOL_PRESETS } from "./toolPresets";
import type { MapNode, MindMapMode, MindMapViewMode } from "./types";

export const useMindMapController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const companyName = user?.company?.name || "";
  const companyId = user?.company?.id || (user as { companyId?: string })?.companyId || "default";

  const companyActiveApps = useMemo(() => {
    const anyUser = user as { company?: { activeApps?: unknown[] }; activeApps?: unknown[] };
    const apps = Array.isArray(anyUser?.company?.activeApps)
      ? anyUser.company.activeApps
      : Array.isArray(anyUser?.activeApps)
        ? anyUser.activeApps
        : [];
    return apps.map((a: unknown) =>
      String((a as { slug?: string })?.slug || a)
        .toLowerCase()
        .trim(),
    );
  }, [user]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [installedLocally, setInstalledLocally] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const isMindmapInstalled = useMemo(() => {
    if (isSuperAdmin || installedLocally) return true;
    return (
      companyActiveApps.includes("executable-mindmap") ||
      companyActiveApps.includes("mindmap")
    );
  }, [companyActiveApps, isSuperAdmin, installedLocally]);

  const handleInstallMindmap = async () => {
    setIsInstalling(true);
    try {
      await apiClient.post("/marketplace/apps/executable-mindmap/install", {
        pricingModel: "FREE",
      });
      setInstalledLocally(true);
      toast.success(`تم تفعيل تطبيق الخرائط الذهنية بنجاح لشركة ${companyName || ""}`);
      await refreshUser?.();
    } catch (err: unknown) {
      if (
        handleInsufficientWalletBalance(err, navigate, {
          returnUrl: location.pathname + location.search,
          appName: "الخرائط الذهنية التنفيذية",
          itemType: "app",
        })
      ) {
        return;
      }
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "تعذر تفعيل التطبيق، يرجى تفعيله من متجر التطبيقات";
      toast.error(msg);
    } finally {
      setIsInstalling(false);
    }
  };

  const isToolInstalled = (requiredAppSlug?: string) => {
    if (!requiredAppSlug || isSuperAdmin) return true;
    const slugLower = requiredAppSlug.toLowerCase();
    return companyActiveApps.some((a) => a === slugLower || a.includes(slugLower));
  };

  const [nodes, setNodes] = useState<MapNode[]>(() => {
    try {
      const saved = localStorage.getItem(`maxp_mindmap_${companyId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return createMasterBlueprint(companyName);
  });

  const [mode, setMode] = useState<MindMapMode>("plan");
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 120 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [trainStepIndex, setTrainStepIndex] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [isDropHintVisible, setIsDropHintVisible] = useState<boolean>(false);
  const [draggedToolType, setDraggedToolType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MindMapViewMode>(() => {
    return typeof window !== "undefined" && window.innerWidth < 640 ? "timeline" : "canvas";
  });
  const [isMinimapOpen, setIsMinimapOpen] = useState<boolean>(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    "stage-plan": true,
    "stage-creative-store": true,
    "stage-ads-chat": true,
    "stage-ops-warehouse": true,
    "stage-finance-growth": true,
  });

  const viewportRef = useRef<HTMLDivElement>(null);
  const draggingNodeRef = useRef<MapNode | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const focusOnStep = (stepNum: number) => {
    setTrainStepIndex(stepNum);
    const node = nodes.find((n) => n.stepOrder === stepNum);
    if (node && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const targetZoom = 1.05;
      setZoom(targetZoom);
      setPan({
        x: rect.width / 2 - node.x * targetZoom - 140,
        y: rect.height / 2 - node.y * targetZoom - 90,
      });
    }
  };

  const switchMode = (newMode: MindMapMode) => {
    setMode(newMode);
    if (newMode === "train") {
      setTrainStepIndex(1);
      focusOnStep(1);
      toast.info("تم تفعيل وضع الشرح والتدريب (Presentation Mode)");
    } else if (newMode === "exec") {
      toast.info("تم تفعيل وضع الأتمتة والتنفيذ (n8n Engine)");
    } else {
      toast.info("تم تفعيل وضع التخطيط والعصف الذهني");
    }
  };

  const nextTrainStep = () => {
    const maxSteps = Math.max(...nodes.map((n) => n.stepOrder || 1));
    if (trainStepIndex < maxSteps) {
      focusOnStep(trainStepIndex + 1);
    } else {
      toast.success("اكتملت جميع خطوات الشرح في هذا المسار التدريبي!");
    }
  };

  const prevTrainStep = () => {
    if (trainStepIndex > 1) {
      focusOnStep(trainStepIndex - 1);
    }
  };

  const runExecutionSimulation = () => {
    switchMode("exec");
    setIsExecuting(true);
    const activeCount = nodes.filter((n) => isToolInstalled(n.requiredAppSlug)).length;
    const totalCount = nodes.length;
    toast.loading(
      `جاري تشغيل مسار العمل التنفيذي ومزامنة ${activeCount}/${totalCount} مرحلة نشطة مع أدوات MaxP...`,
      { id: "exec-toast" },
    );

    setTimeout(() => {
      setIsExecuting(false);
      if (activeCount < totalCount && !isSuperAdmin) {
        toast.success(
          `اكتمل تشغيل المسار! تم تشغيل ${activeCount} أداة مفعّلة بنجاح. يرجى تفعيل باقي الأدوات (${totalCount - activeCount}) للاستفادة الكاملة من الأتمتة.`,
          { id: "exec-toast", duration: 5000 },
        );
      } else {
        toast.success(
          "اكتمل تشغيل المسار بنجاح! تم فحص المؤشرات، تحديث الحسابات، وإرسال الإشعارات لكافة المراحل.",
          { id: "exec-toast" },
        );
      }
    }, 3000);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.35));
  const handleResetZoom = () => {
    setZoom(0.85);
    setPan({ x: 80, y: 120 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".map-node") ||
      (e.target as HTMLElement).closest("#node-actions-bar")
    ) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelectedNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.35), 2.2));
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: MapNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    draggingNodeRef.current = node;
    dragOffsetRef.current = {
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y,
    };

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingNodeRef.current) return;
      const newX = moveEvent.clientX / zoom - dragOffsetRef.current.x;
      const newY = moveEvent.clientY / zoom - dragOffsetRef.current.y;
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeRef.current?.id ? { ...n, x: newX, y: newY } : n)),
      );
    };

    const onGlobalMouseUp = () => {
      draggingNodeRef.current = null;
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);
  };

  const handleToolDragStart = (e: React.DragEvent, toolType: string) => {
    setDraggedToolType(toolType);
    e.dataTransfer.setData("text/plain", toolType);
    e.dataTransfer.effectAllowed = "copy";
    setIsDropHintVisible(true);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDropHintVisible(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropHintVisible(false);
    }
  };

  const addNodeFromPalette = (type: string, customX?: number, customY?: number) => {
    const selected = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
    const newId = "node-" + Date.now();
    const newOrder = nodes.length + 1;

    const baseNode: MapNode = {
      id: newId,
      parentId: customX !== undefined ? undefined : selected?.id,
      stepOrder: newOrder,
      x: customX !== undefined ? customX : selected ? selected.x + 380 : 300,
      y: customY !== undefined ? customY : selected ? selected.y + 40 : 300,
      title: "أداة جديدة",
      subtitle: "إعدادات الأداة في النظام",
      badge: "أداة مضافة",
      color: "border-slate-600 text-slate-300 bg-slate-900",
      iconName: "tool",
      category: "ops",
    };

    const preset = TOOL_PRESETS[type] || {};
    const newNode: MapNode = { ...baseNode, ...preset };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    toast.success(`تمت إضافة أداة: ${newNode.title}`);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropHintVisible(false);
    const toolType = e.dataTransfer.getData("text/plain") || draggedToolType;
    if (!toolType || !viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left - pan.x) / zoom;
    const dropY = (e.clientY - rect.top - pan.y) / zoom;

    addNodeFromPalette(toolType, dropX - 130, dropY - 45);
    setDraggedToolType(null);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId || selectedNodeId === "m-step-1") {
      toast.error("لا يمكن حذف العقدة الرئيسية");
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId && n.parentId !== selectedNodeId));
    setSelectedNodeId(null);
    toast.success("تم حذف العقدة وفروعها");
  };

  const aiExpandNode = () => {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    toast.loading(`يقوم وكيل MaxP الذكي بتحليل: "${node.title}" وتوليد فروع تشغيلية...`, {
      id: "ai-expand",
    });

    setTimeout(() => {
      const newId = "ai-" + Date.now();
      const newNode: MapNode = {
        id: newId,
        parentId: node.id,
        stepOrder: nodes.length + 1,
        title: "فرع تشغيلي مقترح بالذكاء الاصطناعي",
        subtitle: "تحسين تكلفة الشحن ومضاعفة باقات الـ Cross-sell",
        badge: "اقتراح ذكي ✨",
        color: "border-violet-500 text-violet-300 bg-violet-950/40",
        iconName: "sparkles",
        category: "growth",
        x: node.x + 380,
        y: node.y - 50,
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(newId);
      toast.success("تم توليد الفرع الذكي بنجاح!", { id: "ai-expand" });
    }, 1200);
  };

  const handleOpenLiveTool = (route?: string) => {
    if (!route) return;
    navigate(route);
  };

  const handleReloadMasterBlueprint = () => {
    setNodes(createMasterBlueprint(companyName));
    handleResetZoom();
    toast.success("تم تحميل وتحديث قالب دورة التجارة الإلكترونية الشاملة بنجاح!");
  };

  const toggleStageExpanded = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return {
    companyName,
    isSuperAdmin,
    isMindmapInstalled,
    isInstalling,
    handleInstallMindmap,
    isToolInstalled,
    nodes,
    setNodes,
    mode,
    switchMode,
    zoom,
    setZoom,
    pan,
    setPan,
    selectedNodeId,
    setSelectedNodeId,
    trainStepIndex,
    nextTrainStep,
    prevTrainStep,
    isExecuting,
    runExecutionSimulation,
    isSidePanelOpen,
    setIsSidePanelOpen,
    isDropHintVisible,
    viewMode,
    setViewMode,
    isMinimapOpen,
    setIsMinimapOpen,
    expandedStages,
    toggleStageExpanded,
    viewportRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleNodeMouseDown,
    handleToolDragStart,
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
    addNodeFromPalette,
    deleteSelectedNode,
    aiExpandNode,
    handleOpenLiveTool,
    handleReloadMasterBlueprint,
  };
};

export type MindMapController = ReturnType<typeof useMindMapController>;
