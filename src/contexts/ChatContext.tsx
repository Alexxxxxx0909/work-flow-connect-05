import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

export type MessageType = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isPinned?: boolean;
  pinnedUntil?: number;
};

export type ChatType = {
  id: string;
  name: string; // Para chats grupales
  participants: string[]; // IDs de los usuarios
  messages: MessageType[];
  isGroup: boolean;
  lastMessage?: MessageType;
  pendingApproval?: boolean; // Para solicitudes de chat pendientes
  rejected?: boolean; // Para solicitudes rechazadas
  isFavorite?: boolean; // Para chats favoritos
};

interface ChatContextType {
  chats: ChatType[];
  activeChat: ChatType | null;
  setActiveChat: (chat: ChatType | null) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChat: (participantIds: string[], name?: string) => void;
  getChat: (chatId: string) => ChatType | undefined;
  loadingChats: boolean;
  onlineUsers: string[]; // IDs de usuarios online
  requestChat: (userId: string) => string; // Solicitud de nuevo chat
  approveChat: (chatId: string) => void; // Aprobar solicitud
  rejectChat: (chatId: string) => void; // Rechazar solicitud
  isChatApproved: (chatId: string) => boolean; // Verificar si el chat está aprobado
  isChatRejected: (chatId: string) => boolean; // Verificar si el chat está rechazado
  deleteChat: (chatId: string) => void; // Eliminar chat
  toggleFavoriteChat: (chatId: string) => void; // Marcar/desmarcar chat como favorito
  pinMessage: (chatId: string, messageId: string, duration: string) => void; // Fijar mensaje
  searchMessages: (chatId: string, query: string) => MessageType[]; // Buscar mensajes
  sendFileMessage: (chatId: string, file: File) => Promise<void>; // Enviar mensaje con archivo
  favoriteChats: string[]; // IDs de chats marcados como favoritos
  pinnedMessages: Record<string, MessageType[]>; // Mensajes fijados por chat
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock de usuarios para desarrollo
const MOCK_ONLINE_USERS = ['1', '2', '3'];

// Mock de chats iniciales con conversación más detallada
const INITIAL_CHATS: ChatType[] = [
  {
    id: '1',
    name: 'Proyecto Web App',
    participants: ['1', '2', '3'],
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hola equipo, ¿cómo va el desarrollo de la aplicación?',
        timestamp: Date.now() - 86400000 // 1 día atrás
      },
      {
        id: '2',
        senderId: '2',
        content: 'Bien, estoy terminando las últimas funcionalidades del dashboard',
        timestamp: Date.now() - 82800000
      },
      {
        id: '3',
        senderId: '3',
        content: 'Yo estoy trabajando en el diseño de la interfaz móvil. Tengo algunas dudas sobre los colores que debemos usar.',
        timestamp: Date.now() - 79200000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Podemos seguir la guía de estilo que acordamos. Los colores principales son el morado #9b87f5 y sus variaciones.',
        timestamp: Date.now() - 75600000
      },
      {
        id: '5',
        senderId: '2',
        content: '¿Cuándo es la próxima reunión con el cliente para mostrar el avance?',
        timestamp: Date.now() - 72000000
      },
      {
        id: '6',
        senderId: '1',
        content: 'La reunión está programada para el próximo viernes a las 10am. Por favor, preparen sus demostraciones para ese día.',
        timestamp: Date.now() - 68400000
      },
      {
        id: '7',
        senderId: '3',
        content: 'Perfecto, tendré lista la presentación del diseño para entonces.',
        timestamp: Date.now() - 64800000
      },
      {
        id: '8',
        senderId: '2',
        content: 'Yo también tendré lista la demo de las funcionalidades principales.',
        timestamp: Date.now() - 61200000
      }
    ],
    isGroup: true
  },
  {
    id: '2',
    name: '',
    participants: ['1', '2'],
    messages: [
      {
        id: '1',
        senderId: '2',
        content: 'Hola, vi tu propuesta para el proyecto de e-commerce, me interesa mucho.',
        timestamp: Date.now() - 172800000 // 2 días atrás
      },
      {
        id: '2',
        senderId: '1',
        content: '¡Qué bueno! ¿Tienes alguna pregunta específica sobre la implementación?',
        timestamp: Date.now() - 169200000
      },
      {
        id: '3',
        senderId: '2',
        content: 'Sí, me gustaría saber más sobre la integración con sistemas de pago como Stripe o PayPal.',
        timestamp: Date.now() - 165600000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Claro, podemos implementar ambos. Stripe es más sencillo para integrar y tiene comisiones más bajas, pero PayPal tiene más alcance en Latinoamérica.',
        timestamp: Date.now() - 162000000
      },
      {
        id: '5',
        senderId: '2',
        content: 'Entiendo. Creo que lo mejor sería implementar ambos para dar opciones a los usuarios.',
        timestamp: Date.now() - 158400000
      },
      {
        id: '6',
        senderId: '1',
        content: 'De acuerdo. También podemos agregar MercadoPago si tienes clientes en Latinoamérica.',
        timestamp: Date.now() - 154800000
      },
      {
        id: '7',
        senderId: '2',
        content: '¡Excelente idea! ¿Podemos coordinar una llamada para discutir más detalles?',
        timestamp: Date.now() - 151200000
      }
    ],
    isGroup: false
  },
  {
    id: '3',
    name: 'Soporte Técnico',
    participants: ['1', '3'],
    messages: [
      {
        id: '1',
        senderId: '3',
        content: 'Tengo un problema con la instalación del software. Me aparece un error 404.',
        timestamp: Date.now() - 259200000 // 3 días atrás
      },
      {
        id: '2',
        senderId: '1',
        content: '¿Podrías enviarme una captura de pantalla del error?',
        timestamp: Date.now() - 255600000
      },
      {
        id: '3',
        senderId: '3',
        content: 'Claro, aquí está: [Imagen de error]',
        timestamp: Date.now() - 252000000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Gracias. Parece que estás intentando acceder a un recurso que no existe. ¿Estás usando la última versión?',
        timestamp: Date.now() - 248400000
      },
      {
        id: '5',
        senderId: '3',
        content: 'Déjame verificar... estoy usando la versión 2.1.0',
        timestamp: Date.now() - 244800000
      },
      {
        id: '6',
        senderId: '1',
        content: 'Ese es el problema. La última versión es la 2.3.5. Te recomiendo actualizar para resolver el error.',
        timestamp: Date.now() - 241200000
      }
    ],
    isGroup: false
  }
];

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineUsers] = useState<string[]>(MOCK_ONLINE_USERS);
  const [favoriteChats, setFavoriteChats] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, MessageType[]>>({});

  // Cargar chats al iniciar
  useEffect(() => {
    if (currentUser) {
      // En un caso real, aquí cargaríamos los chats del usuario desde Firebase
      const userChats = INITIAL_CHATS.filter(chat => 
        chat.participants.includes(currentUser.id)
      );
      
      // Añadir la referencia al último mensaje para la vista previa
      const chatsWithLastMessage = userChats.map(chat => ({
        ...chat,
        lastMessage: chat.messages[chat.messages.length - 1]
      }));
      
      setChats(chatsWithLastMessage);
    } else {
      setChats([]);
    }
    setLoadingChats(false);
  }, [currentUser]);

  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  const isChatApproved = (chatId: string) => {
    const chat = getChat(chatId);
    if (!chat) return false;
    return !chat.pendingApproval;
  };

  const isChatRejected = (chatId: string) => {
    const chat = getChat(chatId);
    if (!chat) return false;
    return !!chat.rejected;
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage: MessageType = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now()
    };
    
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage
          };
        }
        return chat;
      });
    });
    
    // En un caso real, aquí enviaríamos el mensaje a Firebase y notificaríamos con Socket.io
  };

  // Función para enviar mensajes con archivos adjuntos
  const sendFileMessage = async (chatId: string, file: File) => {
    if (!currentUser) return;
    
    // En un caso real, aquí subiríamos el archivo a un servicio de almacenamiento 
    // y obtendríamos la URL
    const fakeUploadUrl = `https://storage.example.com/files/${file.name}`;
    
    // Crear el mensaje con la información del archivo
    const fileMessage: MessageType = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content: `[Archivo adjunto] ${file.name}`,
      timestamp: Date.now(),
      fileUrl: fakeUploadUrl,
      fileName: file.name,
      fileType: file.type
    };
    
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, fileMessage],
            lastMessage: fileMessage
          };
        }
        return chat;
      });
    });
  };

  // Función para crear un nuevo chat
  const createChat = (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Verificar que el usuario actual esté incluido
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    const newChat: ChatType = {
      id: `chat_${Date.now()}`,
      name,
      participants: participantIds,
      messages: [],
      isGroup: participantIds.length > 2 || !!name,
    };
    
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
    
    // En un caso real, aquí crearíamos el chat en Firebase
  };

  // Nueva función para solicitar un chat privado
  const requestChat = (userId: string) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    // Verificar si ya existe un chat con este usuario
    const existingChat = chats.find(chat => 
      !chat.isGroup && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(userId)
    );

    if (existingChat) {
      setActiveChat(existingChat);
      return existingChat.id;
    }

    // Crear nuevo chat pendiente de aprobación
    const newChatId = `chat_${Date.now()}`;
    const newChat: ChatType = {
      id: newChatId,
      name: '',
      participants: [currentUser.id, userId],
      messages: [{
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        content: '¡Hola! Me gustaría chatear contigo.',
        timestamp: Date.now()
      }],
      isGroup: false,
      pendingApproval: true
    };

    // Actualizar con el último mensaje
    newChat.lastMessage = newChat.messages[0];
    
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
    
    // Mostrar notificación
    toast({
      title: "Solicitud enviada",
      description: "Se ha enviado una solicitud para iniciar un chat"
    });
    
    return newChatId;
  };

  // Aprobar una solicitud de chat
  const approveChat = (chatId: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          pendingApproval: false,
          rejected: false
        };
      }
      return chat;
    }));
    
    toast({
      title: "Solicitud aceptada",
      description: "Ahora puedes chatear con este usuario"
    });
  };

  // Rechazar una solicitud de chat
  const rejectChat = (chatId: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          pendingApproval: false,
          rejected: true
        };
      }
      return chat;
    }));
    
    toast({
      title: "Solicitud rechazada",
      description: "Has rechazado esta solicitud de chat"
    });
  };

  // Delete chat
  const deleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    // If the active chat is being deleted, set it to null
    if (activeChat && activeChat.id === chatId) {
      setActiveChat(null);
    }
    
    // Remove from favorites if present
    if (favoriteChats.includes(chatId)) {
      setFavoriteChats(prev => prev.filter(id => id !== chatId));
    }
    
    // Remove any pinned messages from this chat
    if (pinnedMessages[chatId]) {
      const newPinnedMessages = { ...pinnedMessages };
      delete newPinnedMessages[chatId];
      setPinnedMessages(newPinnedMessages);
    }
    
    toast({
      title: "Chat eliminado",
      description: "La conversación ha sido eliminada permanentemente."
    });
  };

  // Toggle favorite chat
  const toggleFavoriteChat = (chatId: string) => {
    const isFavorite = favoriteChats.includes(chatId);
    
    if (isFavorite) {
      setFavoriteChats(prev => prev.filter(id => id !== chatId));
      toast({
        title: "Chat eliminado de favoritos",
        description: "La conversación ha sido eliminada de tus favoritos."
      });
    } else {
      setFavoriteChats(prev => [...prev, chatId]);
      toast({
        title: "Chat añadido a favoritos",
        description: "La conversación ha sido añadida a tus favoritos."
      });
    }
    
    // Update the chat object to reflect favorite status
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, isFavorite: !isFavorite };
      }
      return chat;
    }));
  };

  // Pin message
  const pinMessage = (chatId: string, messageId: string, duration: string) => {
    // Convert duration string to milliseconds
    const durationMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const durationMs = durationMap[duration as keyof typeof durationMap];
    const pinnedUntil = Date.now() + durationMs;
    
    // Update the message in chats
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, isPinned: true, pinnedUntil };
            }
            return msg;
          });
          
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
    });
    
    // Add to pinned messages
    const chat = getChat(chatId);
    if (chat) {
      const message = chat.messages.find(msg => msg.id === messageId);
      if (message) {
        const pinnedMessage = { ...message, isPinned: true, pinnedUntil };
        
        setPinnedMessages(prev => {
          const chatPinnedMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...chatPinnedMessages, pinnedMessage]
          };
        });
      }
    }
  };

  // Search messages
  const searchMessages = (chatId: string, query: string): MessageType[] => {
    const chat = getChat(chatId);
    if (!chat || !query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return chat.messages.filter(msg => 
      msg.content.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        sendMessage,
        createChat,
        getChat,
        loadingChats,
        onlineUsers,
        requestChat,
        approveChat,
        rejectChat,
        isChatApproved,
        isChatRejected,
        deleteChat,
        toggleFavoriteChat,
        pinMessage,
        searchMessages,
        sendFileMessage,
        favoriteChats,
        pinnedMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
