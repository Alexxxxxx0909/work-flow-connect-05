
import React, { useState } from 'react';
import { useJobs, JobType } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { JobEditForm } from './JobEditForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from 'lucide-react';

interface JobActionsProps {
  job: JobType;
  onDeleted?: () => void;
}

export const JobActions: React.FC<JobActionsProps> = ({ job, onDeleted }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  const { deleteJob } = useJobs();
  const { toast } = useToast();

  // Check if user is the owner of this job
  const isOwner = currentUser && currentUser.id === job.userId;

  const handleDeleteConfirm = async () => {
    try {
      await deleteJob(job.id);
      
      toast({
        title: "Propuesta eliminada",
        description: "La propuesta ha sido eliminada correctamente."
      });
      
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar la propuesta."
      });
    }
  };

  if (!isOwner) return null;

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center text-wfc-purple hover:text-wfc-purple-medium hover:bg-wfc-purple/10" 
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </div>

      {/* Edit form dialog */}
      <JobEditForm 
        job={job} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta propuesta y todos sus comentarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
