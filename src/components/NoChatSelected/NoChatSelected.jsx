import noChatSelectedImg from "../../assets/no-chat-selected.png";
import Button from "../Button/Button.jsx";

export default function NoChatSelected({ onStartAddChat }) {
  return (
    <div className="mt-24 text-center w-2/3">
      <img src={ noChatSelectedImg } alt="Chat bubbles" className="w-16 h-16 object-contain mx-auto" />
      <h2 className="text-xl font-bold text-stone-500 my-4">No chat selected</h2>
      <p className="text-stone-400 mb-4">
        Select a chat or create one
      </p>
      <p className="mt-8">
        <Button onClick={ onStartAddChat }>+ Create a chat</Button>
      </p>
    </div>
  )
}