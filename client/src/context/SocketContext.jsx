import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?.token) {
      const socketUrl = import.meta.env.MODE === "production"
        ? window.location.origin
        : "http://localhost:5000";

      const newSocket = io(socketUrl, {
        auth: { token: user.token },
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);