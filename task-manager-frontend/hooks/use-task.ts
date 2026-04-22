import { useTask as useTaskContext } from "@/context/tasks-context";

export const useTask = () => {
  const context = useTaskContext();
  return context;
};
