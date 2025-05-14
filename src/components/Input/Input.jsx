// Customizable Input component
export default function Input({ textarea, ...props }) {
  const inputClasses = "w-1/4 p-1 border-b-2 rounded-lg border-stone-300 bg-stone-200 text-stone-600 focus:outline-none focus:border-stone-600 my-16 focus:ring-blue-500 focus:border-green-500";

  return (
    textarea ? (
      <textarea className={inputClasses} {...props} />
    ) : (
      <input className={inputClasses} {...props} />
    )
  );
}
