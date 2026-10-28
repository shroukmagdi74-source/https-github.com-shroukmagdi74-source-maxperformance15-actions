export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
    case "high":
      return "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
    case "low":
      return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "عاجل";
    case "high":
      return "عالي";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return priority;
  }
};
