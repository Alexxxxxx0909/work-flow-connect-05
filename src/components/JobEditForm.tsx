
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs, JobType } from '@/contexts/JobContext';

interface JobEditFormProps {
  job: JobType;
  isOpen: boolean;
  onClose: () => void;
}

export const JobEditForm: React.FC<JobEditFormProps> = ({ job, isOpen, onClose }) => {
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [category, setCategory] = useState(job.category);
  const [budget, setBudget] = useState(job.budget.toString());
  const [selectedSkills, setSelectedSkills] = useState<string[]>(job.skills);
  const [status, setStatus] = useState(job.status);
  
  const { toast } = useToast();
  const { jobCategories, skillsList } = useData();
  const { currentUser } = useAuth();
  const { updateJob } = useJobs();

  // Update form when job changes
  useEffect(() => {
    setTitle(job.title);
    setDescription(job.description);
    setCategory(job.category);
    setBudget(job.budget.toString());
    setSelectedSkills(job.skills);
    setStatus(job.status);
  }, [job]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget || selectedSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos y selecciona al menos una habilidad."
      });
      return;
    }

    if (!currentUser || currentUser.id !== job.userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No tienes permiso para editar esta propuesta."
      });
      return;
    }

    try {
      await updateJob(job.id, {
        title,
        description,
        budget: Number(budget),
        category,
        skills: selectedSkills,
        status,
      });

      toast({
        title: "Éxito",
        description: "La propuesta se ha actualizado correctamente."
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar la propuesta. Inténtalo de nuevo."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar propuesta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div>
            <Label htmlFor="title">Título de la propuesta</Label>
            <Input
              type="text"
              id="title"
              placeholder="Ej: Diseño de logo para empresa de tecnología"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descripción de la propuesta</Label>
            <Textarea
              id="description"
              placeholder="Describe los detalles del trabajo que necesitas realizar."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="budget">Presupuesto (USD)</Label>
            <Input
              type="number"
              id="budget"
              placeholder="Ej: 500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={status}
              onValueChange={(value: 'open' | 'in-progress' | 'completed') => setStatus(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block">Habilidades requeridas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {skillsList.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`skill-${skill}`} 
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <label 
                    htmlFor={`skill-${skill}`}
                    className="text-sm cursor-pointer"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-wfc-purple hover:bg-wfc-purple-medium">
              Actualizar propuesta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
