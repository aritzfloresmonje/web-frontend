import Input from "../Input/Input.jsx";

import { useRef, useEffect } from "react";

export default function SelectedChat({ chat, onSendMessage, onDelete }) {
  const messageInput = useRef();
  const messagesEndRef = useRef(null);

  // Scroll down when there are too many messages
  useEffect(() => {
    if(messagesEndRef.current && chat.messages.length > 6) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages]);
  
  const cssClasses = "border-double border-black border-2 w-max max-w-md break-words rounded-md shadow-lg shadow-green-200/50 whitespace-pre-wrap mx-64";
  let left = cssClasses + " float-left";
  let right = cssClasses + " float-right";

  return (
    <div className="my-8 w-4/5 flex flex-col h-full">
      <div className="mb-2 flex gap-2">
        <span className="font-semibold">{ chat.users.find(c => c.userName !== sessionStorage.getItem("username")).userName }</span>
        <button onClick={ onDelete } className="text-red-600 font-semibold hover:font-bold">Delete</button>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2 border rounded-md border-solid border-green-700">
        {
          chat.messages.map((msg, index) => {
            const previousMsg = chat.messages[index - 1];
            const [ user1, user2 ] = chat.users;
            const messageSender = user1._id === msg.sender ? user1.userName : user2.userName;
            const sameSender = previousMsg && previousMsg.sender === msg.sender;

            return (
              <div key={ index } className={ sameSender ? "mt-2" : "mt-6" }>
                <div className={ messageSender === sessionStorage.getItem("username") ? right : left }>
                  <p className="mx-2">{ msg.content }</p>
                </div>
              </div>
            );
          })
        }
        <div ref={messagesEndRef}></div>
      </div>
      <div className="flex justify-center gap-2 my-16">
        <Input textarea ref={ messageInput } placeholder={ `Write something to ${ chat.users.find(u => u.userName !== sessionStorage.getItem("username")).userName }` } rows="1" />
        <button onClick={ () => {
          const msg = messageInput.current.value;
          if(msg.trim() !== "") {
            onSendMessage(chat, msg.trim(), sessionStorage.getItem("id"));
            messageInput.current.value = "";
          }
        }}>
          <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}