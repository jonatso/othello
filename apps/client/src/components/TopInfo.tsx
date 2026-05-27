import { Clipboard, LogOut, Radio } from "lucide-react";

interface TopInfoProps {
  connectText: string;
  gameUrl?: string;
  clickCopyLink: () => void;
  clickLeave: () => void;
}

const TopInfo = ({ connectText, gameUrl, clickCopyLink, clickLeave }: TopInfoProps) => (
  <div className="top-info">
    <div className="status-pill">
      <Radio size={17} strokeWidth={2.2} />
      <p>{connectText}</p>
    </div>
    <div className="top-actions">
      {gameUrl && (
        <button
          className="icon-button"
          type="button"
          onClick={clickCopyLink}
          title="Copy game link"
        >
          <Clipboard size={18} strokeWidth={2.2} />
          <span>Copy link</span>
        </button>
      )}
      <button className="icon-button" type="button" onClick={clickLeave} title="Leave game">
        <LogOut size={18} strokeWidth={2.2} />
        <span>Leave</span>
      </button>
    </div>
  </div>
);

export default TopInfo;
