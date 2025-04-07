
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSearchDialog: React.FC<UserSearchDialogProps> = ({ isOpen, onClose }) => {
  const { getAllUsers } = useData();
  const { requestChat } = useChat();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(user => 
    user.id !== currentUser?.id && // Excluir al usuario actual
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartChat = (userId: string) => {
    requestChat(userId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar usuarios</DialogTitle>
          <DialogDescription>
            Encuentra usuarios para iniciar una conversación
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchQuery ? 'No se encontraron usuarios' : 'Escribe para buscar usuarios'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{user.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-wfc-purple hover:bg-wfc-purple/10 dark:text-wfc-purple-light dark:hover:bg-wfc-purple/20"
                    onClick={() => handleStartChat(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Mensaje
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
