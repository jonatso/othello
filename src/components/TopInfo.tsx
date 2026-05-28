import { Clipboard, LogOut, Radio } from "lucide-react";

interface TopInfoProps {
  connectText: string;
  gameUrl?: string;
  clickCopyLink: () => void;
  clickLeave: () => void;
}

const TopInfo = ({ connectText, gameUrl, clickCopyLink, clickLeave }: TopInfoProps) => (
  <div className="flex w-[min(94vw,620px)] items-center justify-between gap-3 sm:w-[min(92vw,620px)]">
    <div className="inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-[#141719c7] px-4 text-[#dce6de] shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-[18px]">
      <Radio size={17} strokeWidth={2.2} />
      <p className="m-0">{connectText}</p>
    </div>
    <div className="inline-flex gap-2">
      {gameUrl && (
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3.5 font-bold text-[#f5f7f3] transition-[transform,background,border-color,color] duration-150 hover:-translate-y-px"
          type="button"
          onClick={clickCopyLink}
          title="Copy game link"
        >
          <Clipboard size={18} strokeWidth={2.2} />
          <span className="hidden sm:inline">Copy link</span>
        </button>
      )}
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3.5 font-bold text-[#f5f7f3] transition-[transform,background,border-color,color] duration-150 hover:-translate-y-px"
        type="button"
        onClick={clickLeave}
        title="Leave game"
      >
        <LogOut size={18} strokeWidth={2.2} />
        <span className="hidden sm:inline">Leave</span>
      </button>
    </div>
  </div>
);

export default TopInfo;
