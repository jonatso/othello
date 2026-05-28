import { useState } from "react";
import { LogIn, Plus } from "lucide-react";

interface ConnectionModalProps {
  initialGameLink?: string;
  clickJoin: (gameLink: string) => void;
  clickHost: () => void;
  joinRoomError: string;
  pendingAction: "host" | "join" | null;
}

const ConnectionModal = ({
  initialGameLink = "",
  clickJoin,
  clickHost,
  joinRoomError,
  pendingAction,
}: ConnectionModalProps) => {
  const [gameLinkInputText, setGameLinkInputText] = useState(initialGameLink);
  const gameLink = gameLinkInputText.trim();

  return (
    <form
      className="fixed left-1/2 top-1/2 z-10 flex w-[min(92vw,410px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-white/15 bg-[#121516e6] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-[22px] sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (pendingAction || !gameLink.startsWith("othello://")) return;
        clickJoin(gameLink);
        setGameLinkInputText("");
      }}
    >
      <div className="grid justify-items-start gap-2.5">
        <img
          className="aspect-square w-[88px] rounded-[20px] shadow-[0_16px_34px_rgba(0,0,0,0.34)]"
          src="/othello.svg"
          alt=""
          aria-hidden="true"
        />
        <h1 className="m-0 text-4xl leading-none text-[#f8faf7]">Othello</h1>
      </div>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#c9edbd] font-bold text-[#102016] transition-[transform,background,color] duration-150 hover:-translate-y-px hover:bg-[#d8f5ce] disabled:cursor-not-allowed disabled:bg-[#c9edbd9e] disabled:text-[#1020169e] disabled:hover:translate-y-0"
        type="button"
        disabled={pendingAction !== null}
        onClick={clickHost}
      >
        <Plus size={18} strokeWidth={2.3} />
        <span>{pendingAction === "host" ? "Creating game..." : "Host game"}</span>
      </button>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
        <input
          className="min-h-11 min-w-0 rounded-lg border border-white/15 bg-white/10 px-3.5 text-[#f7faf5] outline-none focus:border-[#c9edbdbf] focus:shadow-[0_0_0_3px_rgba(201,237,189,0.16)]"
          type="text"
          value={gameLinkInputText}
          placeholder="othello://join/..."
          autoComplete="off"
          onChange={(e) => setGameLinkInputText(e.target.value)}
        />
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 font-bold text-[#f8faf7] transition-[transform,background,border-color,color] duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:text-[#f8faf761] disabled:hover:translate-y-0"
          type="submit"
          disabled={pendingAction !== null || !gameLink.startsWith("othello://")}
        >
          <LogIn size={18} strokeWidth={2.3} />
          <span>{pendingAction === "join" ? "Joining..." : "Join"}</span>
        </button>
      </div>
      <p className="m-0 min-h-5 text-sm font-semibold text-[#ffb8a8]" aria-live="polite">
        {joinRoomError}
      </p>
    </form>
  );
};

export default ConnectionModal;
