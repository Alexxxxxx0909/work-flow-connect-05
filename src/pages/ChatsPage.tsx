import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Plus, 
  UserPlus, 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  PaperclipIcon,
  Pin,
  FileImage,
  FileAudio,
  FileText,
  File,
  X
} from 'lucide-react';
import { ChatGroupForm } from '@/components/ChatGroupForm';
import { toast } from '@/components/ui/use-toast';
import { UserSearchDialog } from '@/components/UserSearchDialog';
import { ChatRequestActions } from '@/components/ChatRequestActions';
import { ChatActions } from '@/components/ChatActions';
import { Alert, AlertTitle } from '@/components/ui/alert';

const ChatsPage = () => {
  const { 
    chats, 
    activeChat, 
    setActiveChat, 
    sendMessage, 
    onlineUsers, 
    isChatApproved,
    isChatRejected,
    deleteChat,
    toggleFavoriteChat,
    pinMessage,
    searchMessages,
    sendFileMessage,
    favoriteChats,
    pinnedMessages
  } = useChat();
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const [messageText, setMessageText] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{ messageId: string; content: string }[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (activeChat && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat?.messages.length]);
  
  useEffect(() => {
    if (highlightedMessageId) {
      const timer = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedMessageId]);
  
  const getChatName = (chat) => {
    if (chat.name) return chat.name;
    
    if (!chat.isGroup && currentUser) {
      const otherUserId = chat.participants.find((id) => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = getUserById(otherUserId);
        return otherUser ? otherUser.name : 'Chat privado';
      }
    }
    
    return 'Chat';
  };
  
  const getChatAvatar = (chat) => {
    if (!chat.isGroup && currentUser) {
      const otherUserId = chat.participants.find((id) => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = getUserById(otherUserId);
        return otherUser?.photoURL;
      }
    }
    return undefined;
  };
  
  const getAvatarFallback = (chat) => {
    const name = getChatName(chat);
    return name.charAt(0).toUpperCase();
  };
  
  const handleSendMessage = () => {
    if (!activeChat || !messageText.trim() || !isChatApproved(activeChat.id)) return;
    
    sendMessage(activeChat.id, messageText);
    setMessageText('');
  };

  const handleFileUpload = (file: File) => {
    if (!activeChat) return;
    sendFileMessage(activeChat.id, file);
  };
  
  const scrollToMessage = (messageId: string) => {
    setHighlightedMessageId(messageId);
    
    if (messageRefs.current[messageId]) {
      requestAnimationFrame(() => {
        messageRefs.current[messageId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      });
    }
    
    closeSearchResults();
  };
  
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchResults([]);
  };
  
  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    
    if (window.innerWidth < 768) {
      setSidebarCollapsed(false);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleInsertEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  const processedChats = () => {
    let filtered = chats.filter(chat => 
      getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (favoriteChats.includes(a.id) && !favoriteChats.includes(b.id)) return -1;
      if (!favoriteChats.includes(a.id) && favoriteChats.includes(b.id)) return 1;
      
      if (a.lastMessage && b.lastMessage) {
        return b.lastMessage.timestamp - a.lastMessage.timestamp;
      }
      
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      
      return 0;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getActiveChatPinnedMessages = () => {
    if (!activeChat) return [];
    
    const now = Date.now();
    
    return activeChat.messages.filter(
      msg => msg.isPinned && msg.pinnedUntil && msg.pinnedUntil > now
    );
  };
  
  const handleSearchInChat = (query: string) => {
    if (!activeChat) return [];
    
    const results = searchMessages(activeChat.id, query);
    
    if (results.length > 0) {
      setSearchResults(results.map(msg => ({
        messageId: msg.id,
        content: msg.content
      })));
      
      setShowSearchResults(true);
    }
    
    return results;
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        <div className={`relative transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-full md:w-80 lg:w-96'}`}>
          {!sidebarCollapsed && (
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg dark:text-white">Mensajes</h2>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full"
                            onClick={() => setIsCreatingGroup(true)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Crear chat grupal</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full"
                            onClick={() => setIsSearchingUser(true)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Buscar usuarios</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {processedChats().length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    {searchQuery ? (
                      <p className="text-gray-500 dark:text-gray-400">No se encontraron conversaciones</p>
                    ) : (
                      <>
                        <p className="text-gray-500 dark:text-gray-400">No tienes ninguna conversación aún</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-wfc-purple dark:text-wfc-purple-light"
                          onClick={() => setIsSearchingUser(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Buscar usuarios
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {processedChats().map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md
                          ${activeChat?.id === chat.id ? 'bg-wfc-purple/10 border-l-4 border-wfc-purple dark:bg-wfc-purple/20' : ''}
                          ${chat.pendingApproval && chat.participants[0] !== currentUser?.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
                          ${favoriteChats.includes(chat.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        `}
                        onClick={() => setActiveChat(chat)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={getChatAvatar(chat)} />
                            <AvatarFallback className={`bg-wfc-purple-medium text-white`}>
                              {getAvatarFallback(chat)}
                            </AvatarFallback>
                          </Avatar>
                          {favoriteChats.includes(chat.id) && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {chat.isGroup ? (
                            <Badge className="absolute -top-1 -right-1 bg-wfc-purple p-0 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center">
                              <Users className="h-3 w-3" />
                            </Badge>
                          ) : (
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                              ${isUserOnline(chat.participants.find((id) => id !== currentUser?.id)) 
                                ? 'bg-green-500' 
                                : 'bg-gray-300 dark:bg-gray-600'}
                            `} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium leading-tight truncate dark:text-white">
                              {getChatName(chat)}
                              {chat.pendingApproval && chat.participants[0] !== currentUser?.id && (
                                <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                  Nueva solicitud
                                </Badge>
                              )}
                            </h3>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                            {chat.lastMessage 
                              ? chat.lastMessage.content 
                              : 'No hay mensajes aún'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-wfc-purple text-white rounded-full h-8 w-8 flex items-center justify-center shadow-md z-10 hover:bg-wfc-purple-medium transition-colors"
            aria-label={sidebarCollapsed ? "Mostrar contactos" : "Ocultar contactos"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-0' : 'ml-4'}`}>
          <Card className="h-full flex flex-col">
            {activeChat ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {sidebarCollapsed && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleSidebar} 
                        className="mr-2"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar>
                      <AvatarImage src={getChatAvatar(activeChat)} />
                      <AvatarFallback className="bg-wfc-purple-medium text-white">
                        {getAvatarFallback(activeChat)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold truncate dark:text-white">{getChatName(activeChat)}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeChat.isGroup 
                          ? `${activeChat.participants.length} participantes` 
                          : isUserOnline(activeChat.participants.find((id) => id !== currentUser?.id))
                            ? 'En línea'
                            : 'Desconectado'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <ChatActions 
                    chat={activeChat}
                    onDelete={handleDeleteChat}
                    onToggleFavorite={toggleFavoriteChat}
                    onPinMessage={(messageId, duration) => pinMessage(activeChat.id, messageId, duration)}
                    onSearchMessages={handleSearchInChat}
                    onFileUpload={handleFileUpload}
                    onInsertEmoji={handleInsertEmoji}
                    isFavorite={favoriteChats.includes(activeChat.id)}
                    scrollToMessage={scrollToMessage}
                  />
                </div>
                
                {isChatRejected(activeChat.id) && (
                  <Alert variant="destructive" className="m-4">
                    <AlertTitle>Solicitud rechazada</AlertTitle>
                    <p>El usuario ha rechazado tu solicitud de chat.</p>
                  </Alert>
                )}
                
                {getActiveChatPinnedMessages().length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/60 border-b p-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Pin className="h-4 w-4 text-wfc-purple dark:text-wfc-purple-light" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Mensajes fijados</p>
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {getActiveChatPinnedMessages().map(pinnedMsg => (
                        <div 
                          key={pinnedMsg.id} 
                          className="text-sm bg-white dark:bg-gray-700 rounded p-2 shadow-sm border cursor-pointer"
                          onClick={() => scrollToMessage(pinnedMsg.id)}
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getUserById(pinnedMsg.senderId)?.name || 'Usuario'} • {formatTime(pinnedMsg.timestamp)}
                          </p>
                          <p className="truncate dark:text-white">{pinnedMsg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {showSearchResults && searchResults.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/60 border-b p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-wfc-purple dark:text-wfc-purple-light" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {searchResults.length} resultados encontrados
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={e => {
                          e.preventDefault();
                          closeSearchResults();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div 
                          key={index} 
                          className="text-sm bg-white dark:bg-gray-700 rounded p-2 shadow-sm border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={e => {
                            e.preventDefault();
                            scrollToMessage(result.messageId);
                          }}
                        >
                          <p className="dark:text-white">
                            {result.content.length > 100 
                              ? `${result.content.substring(0, 100)}...` 
                              : result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <ScrollArea 
                  className="flex-1 p-4"
                  ref={messagesContainerRef}>
                  {activeChat.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 dark:text-gray-400">No hay mensajes aún</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Envía un mensaje para iniciar la conversación</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeChat.messages.map((message, index, messages) => {
                        const isCurrentUser = currentUser && message.senderId === currentUser.id;
                        const sender = getUserById(message.senderId);
                        
                        const showDateSeparator = index === 0 || 
                          new Date(message.timestamp).toDateString() !== 
                          new Date(messages[index - 1].timestamp).toDateString();
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(message.timestamp)}
                                </div>
                              </div>
                            )}
                            
                            <div 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
                              ref={el => {
                                if (el) messageRefs.current[message.id] = el;
                              }}
                            >
                              {!isCurrentUser && (
                                <Avatar className="h-8 w-8 mr-2 mt-1">
                                  <AvatarImage src={sender?.photoURL} />
                                  <AvatarFallback className="bg-wfc-purple-medium text-white">
                                    {sender?.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`max-w-[80%]`}>
                                {!isCurrentUser && activeChat.isGroup && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{sender?.name}</p>
                                )}
                                
                                <div 
                                  className={`rounded-lg px-4 py-2 inline-block transition-all duration-300
                                    ${message.isPinned ? 'border-2 border-amber-300 dark:border-amber-500' : ''}
                                    ${highlightedMessageId === message.id 
                                      ? 'ring-4 ring-wfc-purple ring-opacity-50 shadow-lg scale-105' 
                                      : ''}
                                    ${isCurrentUser 
                                      ? 'bg-wfc-purple text-white rounded-tr-none' 
                                      : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none dark:text-white'}
                                  `}
                                >
                                  {message.fileUrl ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        {message.fileType?.includes('image') ? (
                                          <FileImage className="h-5 w-5" />
                                        ) : message.fileType?.includes('audio') ? (
                                          <FileAudio className="h-5 w-5" />
                                        ) : message.fileType?.includes('text') || message.fileType?.includes('document') ? (
                                          <FileText className="h-5 w-5" />
                                        ) : (
                                          <File className="h-5 w-5" />
                                        )}
                                        <span className="text-sm font-medium truncate">{message.fileName}</span>
                                      </div>
                                      <a 
                                        href={message.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs underline block truncate"
                                      >
                                        Descargar archivo
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="break-words">{message.content}</p>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                
                {activeChat.pendingApproval && 
                 activeChat.participants[0] !== currentUser?.id && 
                 !isChatRejected(activeChat.id) && (
                  <div className="p-4 border-t">
                    <ChatRequestActions chatId={activeChat.id} />
                  </div>
                )}
                
                {(!activeChat.pendingApproval || activeChat.participants[0] === currentUser?.id) && 
                  !isChatRejected(activeChat.id) && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        disabled={activeChat.pendingApproval && !isChatApproved(activeChat.id)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={activeChat.pendingApproval && !isChatApproved(activeChat.id)}
                        className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                      >
                        <PaperclipIcon className="h-4 w-4" />
                      </Button>
                      
                      <ChatActions 
                        chat={activeChat}
                        onDelete={handleDeleteChat}
                        onToggleFavorite={toggleFavoriteChat}
                        onPinMessage={(messageId, duration) => pinMessage(activeChat.id, messageId, duration)}
                        onSearchMessages={handleSearchInChat}
                        onFileUpload={handleFileUpload}
                        onInsertEmoji={handleInsertEmoji}
                        isFavorite={favoriteChats.includes(activeChat.id)}
                        scrollToMessage={scrollToMessage}
                      />
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || (activeChat.pendingApproval && !isChatApproved(activeChat.id))}
                        className="bg-wfc-purple hover:bg-wfc-purple-medium dark:bg-wfc-purple dark:hover:bg-wfc-purple-medium"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                          e.target.value = '';
                        }
                      }}
                      accept=".doc,.docx,.pdf,.txt,.mp3,.mp4,.zip,.rar,.jpg,.jpeg,.png,.gif"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                {sidebarCollapsed && (
                  <Button 
                    variant="outline" 
                    onClick={toggleSidebar} 
                    className="mb-4"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Ver contactos
                  </Button>
                )}
                <h2 className="text-xl font-semibold dark:text-white">Selecciona un chat</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Elige una conversación de la lista o inicia una nueva
                </p>
                <div className="flex space-x-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingGroup(true)}
                    className="dark:border-gray-700 dark:text-gray-300"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Crear chat grupal
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setIsSearchingUser(true)}
                    className="bg-wfc-purple hover:bg-wfc-purple-medium"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Buscar usuarios
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear chat grupal</DialogTitle>
          </DialogHeader>
          <ChatGroupForm onClose={() => setIsCreatingGroup(false)} />
        </DialogContent>
      </Dialog>

      <UserSearchDialog 
        isOpen={isSearchingUser}
        onClose={() => setIsSearchingUser(false)}
      />
    </MainLayout>
  );
};

export default ChatsPage;
