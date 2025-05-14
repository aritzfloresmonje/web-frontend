import Button from "../Button/Button.jsx";
import Modal from "../Modal/Modal.jsx";

import { useRef, useState } from "react";

export default function NewChat({ onSave, onCancel, availableUsers }) {
  const [ selectedUser, setSelectedUser ] = useState("");
  const [ chatName, setChatName ] = useState(selectedUser);
  const [ chatCreationState, setChatCreationState ] = useState(1);

  const modal = useRef();
  const chatNameInput = useRef();

  function handleSelectUser(event) {
    const user = event.target.value;
    setSelectedUser(user);
  }

  function handleNextCreationStep(step) {
    if(chatCreationState === 3 && step === 1) {
      onSave(selectedUser, chatName);
      return;
    }

    if(chatCreationState === 1 && step === -1) {
      return;
    }

    if(chatCreationState === 1 && selectedUser === "") {
      modal.current.open();
      return;
    }

    if(chatCreationState === 2 && step === 1) {
      if(chatNameInput.current) {
        setChatName(chatNameInput.current.value);
      }
    }

    setChatCreationState((prevState) => {
      return step === 1 ? prevState + 1 : prevState - 1;
    })
  }

  return (
    <div className="flex text-center align-middle justify-center h-20 mt-16">
      <Modal ref={ modal } btnText="Sorry :(">
        <p>Please choose a user from the dropwdown menu</p>
      </Modal>

      {
        // chatCreationState = 1 --> choose a user
        chatCreationState === 1 ? (
          <div className="flex gap-2">
            <label htmlFor="users">Choose someone to chat with:  </label>
            <select id="users" size={8} className="border-s-green-900 border-l-4 min-h-[14rem]" onChange={ handleSelectUser }>
              {
                availableUsers.map((user, index) => {
                  return (
                    <option key={ index } value={ user }>{ user }</option>
                  );
                })
              }
            </select>
            <p>
                <Button onClick={() => handleNextCreationStep(1)}>Next</Button><br/><br/>
                <Button onClick={() => handleNextCreationStep(-1)}>Back</Button>
                <Button onClick={onCancel}>Cancel</Button>
            </p>
          </div>
        ) : null
      }

      {
        // chatCreationState = 2 --> choose a name for the chat
        chatCreationState === 2 ? (
          <>
            <div className="flex gap-2">
              <label htmlFor="chat-name-input">Give a name to this chat:  </label>
              <input id="chat-name-input" maxLength={25} placeholder={ selectedUser } defaultValue={ selectedUser } ref={ chatNameInput } className="h-6 border border-solid border-t-0 border-l-0 border-r-0 border-b-4 border-b-green-900" />
            </div>
            <p>
              <Button onClick={() => handleNextCreationStep(1)}>Next</Button><br/><br/>
              <Button onClick={() => handleNextCreationStep(-1)}>Back</Button>
              <Button onClick={onCancel}>Cancel</Button>
            </p>
          </>
        ) : null
      }

      {
        // chatCreationState = 3 --> confirm changes
        chatCreationState === 3 ? (
          <div className="flex gap-20">
            <div className="flex flex-col">
              <p><span className="font-bold">Selected user:</span> <span className="border border-solid border-t-0 border-l-0 border-r-0 border-b-4 border-b-green-900">{ selectedUser }</span></p>
              <p className="mt-6"><span className="font-bold">Chat name:</span> <span className="border border-solid border-t-0 border-l-0 border-r-0 border-b-4 border-b-green-900">{ chatName }</span></p>
            </div>
            <p>
              <Button onClick={() => handleNextCreationStep(1)}>Done</Button><br/><br/>
              <Button onClick={() => handleNextCreationStep(-1)}>Back</Button>
              <Button onClick={onCancel}>Cancel</Button>
            </p>
          </div>
        ) : null
      }
    </div>
  );
}
