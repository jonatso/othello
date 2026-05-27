import { LogOut, Radio } from "lucide-react";

interface TopInfoProps {
  connectText: string;
  clickLeave: () => void;
}

const TopInfo = ({ connectText, clickLeave }: TopInfoProps) => (
  <div className="top-info">
    <div className="status-pill">
      <Radio size={17} strokeWidth={2.2} />
      <p>{connectText}</p>
    </div>
    <button className="icon-button" type="button" onClick={clickLeave} title="Leave game">
      <LogOut size={18} strokeWidth={2.2} />
      <span>Leave</span>
    </button>
  </div>
);

export default TopInfo;
