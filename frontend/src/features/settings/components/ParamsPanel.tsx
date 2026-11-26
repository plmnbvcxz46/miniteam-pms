import { Alert } from "../../../components/ui/Alert";
import { PageState } from "../../../components/patterns/PageState";
import { useConfigs } from "../../../stores/config/useConfigs";
import { ParamsForm } from "./ParamsForm";

/** 系统参数：读取中、读取失败时只显示提示，读到了才显示表单 */
export function ParamsPanel() {
  const { status, error } = useConfigs();
  if (status === "ready") return <ParamsForm />;
  if (status === "error") {
    return (
      <Alert variant="inline" tone="danger">
        {error}
      </Alert>
    );
  }
  return <PageState status="loading" description="加载中…" />;
}
