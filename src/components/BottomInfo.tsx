import clsx from "clsx";

interface BottomInfoProps {
  isMyTurn: boolean;
  playerColor: "white" | "black" | null;
  gameIsOngoing: boolean;
  canRequestRematch: boolean;
  numWhitePieces: number;
  numBlackPieces: number;
  clickRematch: () => void;
}

const BottomInfo = ({
  isMyTurn,
  playerColor,
  gameIsOngoing,
  canRequestRematch,
  numWhitePieces,
  numBlackPieces,
  clickRematch,
}: BottomInfoProps) => (
  <div
    className={clsx(
      "flex w-[min(94vw,620px)] flex-wrap items-center gap-3 sm:w-[min(92vw,620px)]",
      gameIsOngoing ? "justify-between" : "justify-center",
    )}
  >
    <div
      className="inline-flex min-h-11 items-center gap-3 rounded-full border border-white/10 bg-[#141719c7] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-[18px]"
      aria-label="Score"
    >
      <div className="inline-flex min-w-14 items-center gap-[9px] font-extrabold">
        <span className="aspect-square w-5 rounded-full bg-[#f8faf7] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
        <span>{numWhitePieces}</span>
      </div>
      <div className="h-[22px] w-px bg-white/10" />
      <div className="inline-flex min-w-14 items-center justify-end gap-[9px] font-extrabold">
        <span>{numBlackPieces}</span>
        <span className="aspect-square w-5 rounded-full border border-white/15 bg-[#08090b] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
      </div>
    </div>
    {gameIsOngoing && (
      <p
        className={clsx(
          "m-0 inline-flex min-h-11 items-center rounded-full border px-4 font-bold shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-[18px]",
          isMyTurn
            ? "border-[#c3ecb9b3] bg-[#c9edbd] text-[#102016]"
            : "border-white/10 bg-[#141719c7] text-[#b9c4bd]",
        )}
      >
        {isMyTurn ? "Your turn" : "Opponent's turn"}
      </p>
    )}
    {playerColor && <p className="m-0 px-3 font-bold text-[#dce6de]">You are {playerColor}</p>}
    {canRequestRematch && (
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#c9edbd] px-4 font-bold text-[#102016] transition-[transform,background,color] duration-150 hover:-translate-y-px disabled:cursor-wait disabled:bg-[#c9edbd9e] disabled:text-[#1020169e]"
        type="button"
        onClick={clickRematch}
      >
        Rematch
      </button>
    )}
  </div>
);

export default BottomInfo;
