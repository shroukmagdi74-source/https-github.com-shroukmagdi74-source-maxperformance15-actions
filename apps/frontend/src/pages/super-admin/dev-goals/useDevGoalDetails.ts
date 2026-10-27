import { useState, useEffect, useCallback } from "react";
import { buildApiUrl } from "../../../utils/urlHelper";
import i18n from "../../../i18n";
import { Goal, KeyResult, CheckIn, getAuthHeaders } from "./types";

export function useDevGoalDetails(id?: string) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "key-results" | "tasks" | "check-ins"
  >("overview");

  // KR Modal
  const [showKRModal, setShowKRModal] = useState(false);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);
  const [krForm, setKrForm] = useState({
    title: "",
    description: "",
    targetType: "NUMBER",
    targetValue: 0,
    currentValue: 0,
    unit: "",
    weight: 1,
  });

  // Check-in Modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    content: "",
    confidence: "ON_TRACK",
    progressValue: 0,
    blockers: "",
    keyResultId: "",
  });

  const fetchGoal = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`super-admin/dev/goals/${id}`), {
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await response.json();
      if (data.success) setGoal(data.data);
    } catch (err) {
      console.error("Error fetching goal:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCheckIns = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(
        buildApiUrl(`super-admin/dev/goals/${id}/check-ins`),
        {
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
        },
      );
      const data = await response.json();
      if (data.success) setCheckIns(data.data);
    } catch (err) {
      console.error("Error fetching check-ins:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchGoal();
    fetchCheckIns();
  }, [fetchGoal, fetchCheckIns]);

  const handleAddKR = async () => {
    if (!id || !krForm.title.trim()) return;
    try {
      const url = editingKR
        ? buildApiUrl(`super-admin/dev/goals/key-results/${editingKR.id}`)
        : buildApiUrl(`super-admin/dev/goals/${id}/key-results`);
      const response = await fetch(url, {
        method: editingKR ? "PUT" : "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(krForm),
      });
      const data = await response.json();
      if (data.success) {
        setShowKRModal(false);
        setEditingKR(null);
        setKrForm({
          title: "",
          description: "",
          targetType: "NUMBER",
          targetValue: 0,
          currentValue: 0,
          unit: "",
          weight: 1,
        });
        fetchGoal();
      }
    } catch (err) {
      alert(i18n.t("DevGoalDetails.failed_save_181b"));
    }
  };

  const handleDeleteKR = async (krId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه النتيجة الرئيسية؟")) return;
    try {
      const response = await fetch(
        buildApiUrl(`super-admin/dev/goals/key-results/${krId}`),
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      const data = await response.json();
      if (data.success) fetchGoal();
    } catch (err) {
      alert(i18n.t("DevGoalDetails.msg_892b"));
    }
  };

  const handleAddCheckIn = async () => {
    if (!id || !checkInForm.content.trim()) return;
    try {
      const response = await fetch(
        buildApiUrl("super-admin/dev/goals/check-ins"),
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            ...checkInForm,
            goalId: id,
            memberId: goal?.owner?.id,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setShowCheckInModal(false);
        setCheckInForm({
          content: "",
          confidence: "ON_TRACK",
          progressValue: 0,
          blockers: "",
          keyResultId: "",
        });
        fetchCheckIns();
        fetchGoal();
      }
    } catch (err) {
      alert(i18n.t("DevGoalDetails.failed_add_9743"));
    }
  };

  const openNewKRModal = () => {
    setEditingKR(null);
    setKrForm({
      title: "",
      description: "",
      targetType: "NUMBER",
      targetValue: 0,
      currentValue: 0,
      unit: "",
      weight: 1,
    });
    setShowKRModal(true);
  };

  const openEditKRModal = (kr: KeyResult) => {
    setEditingKR(kr);
    setKrForm({
      title: kr.title,
      description: kr.description || "",
      targetType: kr.targetType,
      targetValue: kr.targetValue,
      currentValue: kr.currentValue,
      unit: kr.unit || "",
      weight: kr.weight,
    });
    setShowKRModal(true);
  };

  return {
    goal,
    checkIns,
    loading,
    activeTab,
    setActiveTab,
    showKRModal,
    setShowKRModal,
    editingKR,
    krForm,
    setKrForm,
    showCheckInModal,
    setShowCheckInModal,
    checkInForm,
    setCheckInForm,
    fetchGoal,
    fetchCheckIns,
    handleAddKR,
    handleDeleteKR,
    handleAddCheckIn,
    openNewKRModal,
    openEditKRModal,
  };
}
