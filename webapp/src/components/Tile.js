export default function Tile(props) {
    return (
        <div className={`tile tile--${props.isOdd ? "odd" : "even"}`}></div>
    )
}