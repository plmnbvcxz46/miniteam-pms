import { useContext } from "react";
import { AccessContext, type AccessState } from "./AccessContext";

export function useAccess(): AccessState {
  const state = useContext(AccessContext);
  if (!state) throw new Error("useAccess 要放在 AccessProvider 里面");
  return state;
}
