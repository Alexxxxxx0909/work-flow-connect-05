
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { Check, X } from 'lucide-react';

interface ChatRequestActionsProps {
  chatId: string;
}

export const ChatRequestActions: React.FC<ChatRequestActionsProps> = ({ chatId }) => {
  const { approveChat, rejectChat } = useChat();

  return (
    <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p className="text-sm text-center mb-4 dark:text-gray-300">
        Alguien quiere iniciar una conversación contigo. ¿Aceptas esta solicitud?
      </p>
      <div className="flex justify-center space-x-2">
        <Button
          onClick={() => approveChat(chatId)}
          variant="outline"
          className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400"
        >
          <Check className="h-4 w-4 mr-2" />
          Aceptar
        </Button>
        <Button
          onClick={() => rejectChat(chatId)}
          variant="outline"
          className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400"
        >
          <X className="h-4 w-4 mr-2" />
          Rechazar
        </Button>
      </div>
    </div>
  );
};
