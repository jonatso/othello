interface TopInfoProps {
  connectText: string;
  gameHasStarted: boolean;
  clickLeave: () => void;
}

const TopInfo = ({ connectText, clickLeave }: TopInfoProps) => (
  <div className="connect">
    <p>{connectText}</p>
    <button onClick={clickLeave}>Leave Game</button>
  </div>
);

export default TopInfo;
