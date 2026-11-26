import { useContext } from "react";
import { ConfigContext, type ConfigState } from "./ConfigContext";

export function useConfigs(): ConfigState {
  const state = useContext(ConfigContext);
  if (!state) throw new Error("useConfigs 要放在 ConfigProvider 里面");
  return state;
}
