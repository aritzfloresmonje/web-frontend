export default function Button({ children, ...props }) {
  return (
    <button { ...props } className="px-4 py-2 text-xs md:text-base rounded-md bg-green-600 text-green-950 hover:bg-stone-600 hover:text-stone-100">
      { children }
    </button>
  );
}