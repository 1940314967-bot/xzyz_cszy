type HeaderProps = {
  title: string;
  connected: boolean;
  buttonLabel: string;
  onConnect: () => void;
};

export default function Header({
  title,
  connected,
  buttonLabel,
  onConnect,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5">
      <h2 className="text-3xl font-semibold">{title}</h2>

      <button
        onClick={onConnect}
        className={`rounded-xl px-5 py-3 font-medium text-white transition ${
          connected ? "bg-green-800" : "bg-green-700 hover:bg-green-800"
        }`}
      >
        {buttonLabel}
      </button>
    </header>
  );
}