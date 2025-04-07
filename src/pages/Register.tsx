
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState<'freelancer' | 'client'>('freelancer');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await register(name, email, password, userRole);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente"
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <h1 className="font-bold text-3xl bg-gradient-to-r from-wfc-purple to-wfc-purple-light bg-clip-text text-transparent">
                WorkFlowConnect
              </h1>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para registrarte en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input 
                id="name" 
                placeholder="Ingresa tu nombre completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="correo@ejemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de usuario</Label>
              <RadioGroup 
                defaultValue="freelancer" 
                value={userRole}
                onValueChange={(value) => setUserRole(value as 'freelancer' | 'client')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer" className="cursor-pointer">Freelancer - Ofrezco mis servicios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="cursor-pointer">Cliente - Busco contratar servicios</Label>
                </div>
              </RadioGroup>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-wfc-purple hover:bg-wfc-purple-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-wfc-purple hover:text-wfc-purple-medium">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
