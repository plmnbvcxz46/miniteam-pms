import { useContext } from "react";
import { ProjectContext, type ProjectState } from "./ProjectContext";

export function useProject(): ProjectState {
  const state = useContext(ProjectContext);
  if (!state) throw new Error("useProject 要放在 ProjectProvider 里面");
  return state;
}
