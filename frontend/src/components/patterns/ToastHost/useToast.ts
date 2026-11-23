import { useContext } from "react";
import { ToastContext, type ShowToast } from "./ToastContext";

/** 弹出一条轻提示：toast("已保存") / toast(message, { tone: "danger" }) */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast 要放在 ToastHost 里面");
  return show;
}
