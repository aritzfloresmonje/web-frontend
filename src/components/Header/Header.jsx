export default function Header({ username }) {
  return (
    <header className="bg-green-950 text-white h-10 py-1 flex justify-between items-center">
      <img src="/logo.svg" alt="Logo" className="h-10 w-auto block"/>
      <div className="float-right mr-12">
        Username: <label className="bg-white text-black">
          <span className={ username.trim() !== "" ? "px-4 py-2" : "" }>{ username }</span>
        </label>
      </div>
    </header>
  );
}