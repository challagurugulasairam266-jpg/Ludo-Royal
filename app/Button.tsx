type ButtonProps = {
  onClick: () => void
}

export default function Button({onClick}: ButtonProps) {
  return <button onClick={onClick}>Roll Dice</button>
}
