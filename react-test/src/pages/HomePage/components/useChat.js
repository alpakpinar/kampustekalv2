import {useState, useRef, useEffect} from 'react';
import SocketIOClient from 'socket.io-client';

const NEW_CHAT_MESSAGE_EVENT = 'new_chat_message';
const SOCKET_SERVER_URL = 'http://localhost:8080';

const useChat = (roomId) => {
    const [messages, setMessages] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        // Creates the connection
        socketRef.current = SocketIOClient(SOCKET_SERVER_URL, {
            query: { roomId }
        });

        // Listen to incoming messages
        socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, message => {
            const incomingMessage = {
                ...message,
                ownedByCurrentUser: message.senderId === socketRef.current.id
            };
            setMessages(messages => [...messages, incomingMessage]);
            console.log(incomingMessage);
            console.log(messages);
        });

        return () => {
            socketRef.current.disconnect();
        }
    }, [roomId]);

    const sendMessage = (messageBody) => {
        socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
            body: messageBody,
            senderId: socketRef.current.id
        });
    };

    return { messages, sendMessage }
}

export default useChat;