import ChatSidebar from "./components/ChatSidebar/ChatSidebar.jsx";
import NoChatSelected from "./components/NoChatSelected/NoChatSelected.jsx";
import NewChat from "./components/NewChat/NewChat.jsx";
import SelectedChat from "./components/SelectedChat/SelectedChat.jsx";
import Header from "./components/Header/Header.jsx";

import { useState, useRef, useEffect } from "react";

import axios from "axios";

let usedUsers = [];

export default function App() {
  // selectedChatId --> null: creating a chat, undefined: no chat selected, has a value: chat selected
  const [chatsState, setChatsState] = useState({
    selectedChatId: undefined,
    chats: [],
  });

  const [usersState, setUsersState] = useState({
    isEntered: false,
    users: [],
  });

  const usernameInput = useRef(null);
  const wsocketRef = useRef(null);

  // Load the users from the database
  useEffect(() => {
    axios
      .get(`${process.env.DB_URL}/users`)
      .then((response) =>
        setUsersState((prevState) => {
          return { ...prevState, users: [...response.data] };
        })
      )
      .catch((err) => console.error("Error loading users:", err));
  }, []);

  function handleStartCreateChat() {
    if (usersState.isEntered) {
      setChatsState((prevState) => {
        return {
          ...prevState,
          selectedChatId: null,
        };
      });
    }
  }

  function handleCreateChat(otherUser, chatName) {
    axios
      .post(`${process.env.DB_URL}/chats`, {
        chatName: chatName,
        users: [sessionStorage.getItem("username"), otherUser],
      })
      .then((response) => {
        usedUsers.push(otherUser);

        wsocketRef.current.send(JSON.stringify({ type: "create-chat", chat: response, receiver: otherUser }));

        setChatsState((prevState) => {
          return {
            ...prevState,
            selectedChatId: response.data.id,
            chats: [...prevState.chats, response.data],
          };
        });
      })
      .catch((err) => console.error("Error creating chat in DB:", err));
  }

  function handleCancelCreateChat() {
    setChatsState((prevState) => {
      return {
        ...prevState,
        selectedChatId: undefined,
      };
    });
  }

  function handleSelectChat(id) {
    setChatsState((prevState) => {
      return {
        ...prevState,
        selectedChatId: id,
      };
    });
  }

  function handleDeleteChat() {
    axios
      .delete(`${process.env.DB_URL}/chats/${chatsState.selectedChatId}`)
      .then((response) => {
        setChatsState((prevState) => {
          const chatToDelete = prevState.chats.find(
            (c) => c.id === prevState.selectedChatId
          );
          const userInThatChat = chatToDelete.users.find(
            (u) => u.userName !== sessionStorage.getItem("username")
          ).userName;

          wsocketRef.current.send(JSON.stringify({ type: "delete-chat", chatId: prevState.selectedChatId, receiver: userInThatChat }));

          usedUsers = usedUsers.filter((u) => u !== userInThatChat);

          return {
            ...prevState,
            selectedChatId: undefined,
            chats: prevState.chats.filter(
              (c) => c.id !== prevState.selectedChatId
            ),
          };
        });
      })
      .catch((err) => console.error("Error deleting chat:", err));
  }

  function handleSendMessage(chat, message, sender) {
    // Send the message
    const otherUser = chat.users.find(u => u._id !== sender).userName;
    const senderUsername = usersState.users.find(u => u._id === sender).userName;
    wsocketRef.current.send(JSON.stringify({ type: "msg", sender: senderUsername, receiver: otherUser, content: message }));

    axios
      .post(`${process.env.DB_URL}/chats/${chatsState.selectedChatId}`, {
        sender: senderUsername,
        content: message,
      })
      .then((response) => {
        setChatsState((prevState) => {
          const updatedChats = prevState.chats.map((c) => {
            if (c.id !== chat.id) return c;

            return {
              ...c,
              messages: [...c.messages, { content: message, sender: sender }],
            };
          });

          return {
            ...prevState,
            chats: updatedChats,
          };
        });
      })
      .catch((err) => console.error("Error saving message:", err));
  }

  function openWS(username) {
    const socket = new WebSocket(`${process.env.WS_URL}`);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "connect", username: username }));
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      const responseData = JSON.parse(event.data);
      console.log(responseData);

      switch(responseData.type) {
        case "error":
          console.error("WS error:", responseData.content);
          break;
        case "create-chat":
          const createdChat = responseData.chat.chat.data;
          const [ user1, user2 ] = createdChat.users;
          const otherUser = user1.userName === sessionStorage.getItem("username") ? user2.userName : user1.userName;
          usedUsers.push(otherUser);

          setChatsState((prevState) => {
            return {
              ...prevState,
              chats: [...prevState.chats, createdChat]
            };
          });
          break;
        case "delete-chat":
          // Get the received chat id
          const idOfChatToDelete = responseData.chatId;

          setChatsState((prevState) => {
            if(prevState.chats.length !== 0) {
              const chatToDelete = prevState.chats.find(
                (c) => c.id === idOfChatToDelete
              );
              const userInThatChat = chatToDelete.users.find(
                (u) => u.userName !== sessionStorage.getItem("username")
              ).userName;

              usedUsers = usedUsers.filter((u) => u !== userInThatChat);
            }

            return {
              ...prevState,
              selectedChatId: prevState.selectedChatId !== idOfChatToDelete ? prevState.selectedChatId : undefined,
              chats: prevState.chats.filter(
                (c) => c.id !== prevState.selectedChatId
              ),
            };
          });
          break;
        case "msg":
          const message = responseData.content;
          setChatsState((prevState) => {
            const updatedChats = prevState.chats.map((c) => {
              if (c.id !== prevState.selectedChatId) return c;

              const otherUser = c.users.find(u => u.userName !== sessionStorage.getItem("username"))._id;
              return {
                ...c,
                messages: [...c.messages, { content: message, sender: otherUser }]
              };
            });
            return { ...prevState, chats: updatedChats };
          });
          break;
        default:
          console.warn("Unknown response type from WebSocket server: " + responseData.type);
      }
    };

    socket.onerror = (error) => {
      console.error("WS error:", error);
    };

    window.onbeforeunload = () => {
      const user = sessionStorage.getItem("username");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("id");
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "disconnect", disconnectedUser: user }));
      }
    };

    // Save socket to ref to access it anywhere and maintain it between renders
    wsocketRef.current = socket;
  }

  function findUser(username) {
    return usersState.users.find(u => u.userName === username);
  }

  function handleEnterUsername() {
    if (usernameInput.current && usernameInput.current.value.trim() !== "") {
      const enteredUsername = usernameInput.current.value.trim();
      if (findUser(enteredUsername) === undefined) {
        alert("Please enter an existing username");
        return;
      }

      // Open websocket connection
      openWS(enteredUsername);

      axios
        .get(`${process.env.DB_URL}/chats/${enteredUsername}`)
        .then((response) => {
          const enteredUser = findUser(enteredUsername);
          sessionStorage.setItem("username", enteredUsername);
          sessionStorage.setItem("id", enteredUser._id);
          
          usedUsers.push(enteredUsername);

          for (let i = 0; i < response.data.length; i++) {
            usedUsers.push(
              response.data[i].users.find((u) => u.userName !== enteredUsername).userName
            );
          }

          setUsersState((prevState) => {
            return {
              ...prevState,
              isEntered: true,
            };
          });

          setChatsState((prevState) => {
            return {
              ...prevState,
              chats: [...response.data],
            };
          });
        })
        .catch((err) => console.error("Error getting user chats:", err));
    }
  }

  function getAvailableUsers() {
    const filteredUsers = usersState.users.filter((u) => !usedUsers.includes(u.userName))
    return filteredUsers.map(u => u.userName);
  }

  const selectedChat = chatsState.chats.find(
    (c) => c.id === chatsState.selectedChatId
  );
  let content = (
    <SelectedChat
      chat={selectedChat}
      onSendMessage={handleSendMessage}
      onDelete={handleDeleteChat}
    />
  );

  if (!usersState.isEntered) {
    content = (
      <div className="flex gap-4 my-4">
        Enter your username:{" "}
        <input
          className="h-6 border-b-2 border-green-700 focus:outline-none focus:border-b-4"
          ref={usernameInput}
          maxLength={12}
        />
        <button
          className="h-6 bg-green-600 text-green-950 rounded-md"
          onClick={handleEnterUsername}
        >
          <span className="px-4 py-2">Submit</span>
        </button>
      </div>
    );
  } else if (chatsState.selectedChatId === null) {
    // Creating a new chat
    content = (
      <NewChat
        onSave={handleCreateChat}
        onCancel={handleCancelCreateChat}
        availableUsers={getAvailableUsers()}
      />
    );
  } else if (chatsState.selectedChatId === undefined) {
    // No chat selected
    content = <NoChatSelected onStartAddChat={handleStartCreateChat} />;
  }

  return (
    <>
      <Header username={sessionStorage.getItem("username") || ""} />
      <main className="h-screen flex gap-8">
        <ChatSidebar
          onStartAddChat={handleStartCreateChat}
          onSelectChat={handleSelectChat}
          selectedChatId={chatsState.selectedChatId}
          chats={chatsState.chats}
        />
        {content}
      </main>
      <footer className="bg-green-950 h-10">Beñat Sagarzazu, Yuyuan Jiang y Aritz Flores; 2025 ©</footer>
    </>
  );
}
