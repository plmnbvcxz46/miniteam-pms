import { currentUser, myProjectRole, roleLabel } from "../../../data/global";

export default function UserChip({ onClick }: { onClick: () => void }) {
  return (
    <button className="me" type="button" onClick={onClick}>
      <span>{currentUser.realName.slice(0, 1)}</span>
      <em>
        {currentUser.realName}
        <small>
          {currentUser.username} · {roleLabel[myProjectRole]}
        </small>
      </em>
    </button>
  );
}
