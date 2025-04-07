
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';

interface ChatGroupFormProps {
  onClose: () => void;
}

export const ChatGroupForm: React.FC<ChatGroupFormProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { getAllUsers } = useData();
  const { createChat } = useChat();
  const { toast } = useToast();
  
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const allUsers = getAllUsers().filter(user => user.id !== currentUser?.id);
  
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  const handleCreateGroup = () => {
    if (!currentUser) return;
    
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona al menos un participante para el grupo"
      });
      return;
    }
    
    // Add current user to participants
    const participants = [...selectedUsers, currentUser.id];
    
    // Create chat with or without name
    createChat(participants, groupName.trim() || undefined);
    
    toast({
      title: "Grupo creado",
      description: "El chat grupal ha sido creado exitosamente"
    });
    
    onClose();
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="group-name">Nombre del grupo (opcional)</Label>
        <Input 
          id="group-name"
          placeholder="Ej. Proyecto Marketing"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Selecciona participantes</Label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="flex items-center mt-2 mb-1">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-500">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
            </span>
          </div>
        )}
        
        <Card className="border dark:border-gray-700">
          <CardContent className="p-2">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">
                    No se encontraron usuarios
                  </p>
                ) : (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                        className="flex-none"
                      />
                      <Avatar className="flex-none">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-wfc-purple-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleCreateGroup}>
          Crear grupo
        </Button>
      </div>
    </div>
  );
};
