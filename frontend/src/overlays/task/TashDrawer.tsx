import Drawer from "../../components/Drawer";

export default function FormDrawer({ onClose }: { onClose: () => void }) {
  return (
    <Drawer className="ov fx" labelledBy="fx-title" onClose={onClose}>
      <div className="fx-head">
        <h2 className="fx-title" id="fx-title">新建任务</h2>
        <button className="ov-close" type="button">
          关闭<span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="double"><i /><i /></div>
      <form className="fx-body" noValidate>
        {/* 原型里是空的，字段由 JS 生成；以后再写 */}
      </form>
    </Drawer>
  );
}
