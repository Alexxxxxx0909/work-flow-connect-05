
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { useNavigate } from 'react-router-dom';

const CreateJobPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const { jobCategories, skillsList } = useData();
  const { currentUser } = useAuth();
  const { createJob } = useJobs();
  const navigate = useNavigate();

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

    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear una propuesta."
      });
      return;
    }

    try {
      // Create the job with the data from the form
      await createJob({
        title,
        description,
        budget: Number(budget),
        category,
        skills: selectedSkills,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photoURL,
        status: 'open'
      });

      toast({
        title: "Éxito",
        description: "La propuesta se ha creado correctamente."
      });

      // Redirigir al usuario a la página de propuestas
      navigate('/jobs');
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear la propuesta. Inténtalo de nuevo."
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold mb-6">Crear una nueva propuesta</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <Button type="submit" className="bg-wfc-purple hover:bg-wfc-purple-medium">
                Crear propuesta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateJobPage;
