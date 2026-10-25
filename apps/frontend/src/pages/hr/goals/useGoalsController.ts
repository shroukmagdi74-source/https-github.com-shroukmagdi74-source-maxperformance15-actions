import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import { GoalRecord, GoalStats, GoalType, ProjectOption } from "./types";
import { ensureArray, getGoalOwnerLabel } from "./helpers";

export const useGoalsController = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [goalType, setGoalType] = useState<"ALL" | GoalType>("ALL");
  const [status, setStatus] = useState("ALL");
  const [projectId, setProjectId] = useState("");
  const [includeDaily, setIncludeDaily] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(
        ensureArray<ProjectOption>(
          response.data?.data?.projects ||
            response.data?.data ||
            response.data?.projects,
        ),
      );
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (goalType !== "ALL") {
        params.set("goalType", goalType);
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (projectId) {
        params.set("projectId", projectId);
      }

      if (!includeDaily && goalType !== "DAILY") {
        params.set("includeDaily", "false");
      }

      const query = params.toString();
      const [goalsResponse, statsResponse] = await Promise.all([
        api.get(`/tasks/goals${query ? `?${query}` : ""}`),
        api.get(`/tasks/goals/stats${query ? `?${query}` : ""}`),
      ]);

      setGoals(
        ensureArray<GoalRecord>(
          goalsResponse.data?.goals ||
            goalsResponse.data?.data ||
            goalsResponse.data?.data?.goals,
        ),
      );
      setStats(statsResponse.data?.stats || null);
    } catch (error) {
      console.error("Error fetching goals:", error);
      tToast.error("Goals.unable_load_2181");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  useEffect(() => {
    void fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalType, status, projectId, includeDaily]);

  const filteredGoals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return goals;
    }

    return goals.filter((goal) => {
      const owner = getGoalOwnerLabel(goal).toLowerCase();
      return (
        goal.title.toLowerCase().includes(normalizedSearch) ||
        (goal.description || "").toLowerCase().includes(normalizedSearch) ||
        owner.includes(normalizedSearch)
      );
    });
  }, [goals, search]);

  const dailyGoalsCount = useMemo(
    () => goals.filter((goal) => goal.goalType === "DAILY").length,
    [goals],
  );

  const goToNewGoal = () => navigate("/goals/new");
  const goToGoalDetails = (goalId: string) => navigate(`/goals/${goalId}`);

  return {
    loading,
    stats,
    projects,
    goalType,
    setGoalType,
    status,
    setStatus,
    projectId,
    setProjectId,
    includeDaily,
    setIncludeDaily,
    search,
    setSearch,
    filteredGoals,
    dailyGoalsCount,
    goToNewGoal,
    goToGoalDetails,
  };
};
