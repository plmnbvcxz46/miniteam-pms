import { currentUser, myProjectRole, roleLabel } from "../../../data/global";

interface UserChipProps {
  /** 个人资料里改过姓名后跟着变 */
  realName: string;
  onClick: () => void;
}

export default function UserChip({ realName, onClick }: UserChipProps) {
  return (
    <button className="me" type="button" onClick={onClick}>
      <span>{realName.slice(0, 1)}</span>
      <em>
        {realName}
        <small>
          {currentUser.username} · {roleLabel[myProjectRole]}
        </small>
      </em>
    </button>
  );
}
