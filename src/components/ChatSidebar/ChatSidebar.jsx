import Button from "../Button/Button.jsx";

export default function ChatSidebar({
  onStartAddChat,
  onSelectChat,
  selectedChatId,
  chats
}) {
  return (
    <aside className="w-1/3 px-8 py-16 bg-green-900 text-stone-50 md:w-72">
      <h2 className="mb-8 font-bold uppercase md:text-xl text-stone-200">
        Your chats
      </h2>
      <div>
        <Button onClick={ onStartAddChat }>+ Create chat</Button>
      </div>
      <ul className="mt-8">
        {
          chats.map((chat) => {
            let classes = "w-full text-left px-2 py-1 rounded-sm my-1 hover:text-green-300 hover:bg-green-800";

            if(chat.id === selectedChatId) {
              classes += " bg-green-700 text-green-200";
            }
            else {
              classes += "text-green-400";
            }

            return (
              <li key={ chat.id } className={ classes }>
                <button
                  onClick={ () => onSelectChat(chat.id) }
                >
                  { chat.chatName }
                </button>
              </li>
            );
          })
        }
      </ul>
    </aside>
  );
}