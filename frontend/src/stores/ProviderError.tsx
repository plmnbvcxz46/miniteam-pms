import { PageState } from "../components/patterns/PageState";
import styles from "./ProviderError.module.css";

interface ProviderErrorProps {
  description: string;
  onRetry: () => void;
}

export function ProviderError({ description, onRetry }: ProviderErrorProps) {
  return (
    <div className={styles.wrap}>
      <PageState
        status="error"
        kicker="// SYSTEM"
        title="数据加载"
        accentTitle="失败"
        description={description}
        onRetry={onRetry}
      />
    </div>
  );
}
