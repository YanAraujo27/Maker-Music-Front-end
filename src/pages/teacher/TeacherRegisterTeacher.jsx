import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTeachers, setTeachers, getUsers, setUsers } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Briefcase } from 'lucide-react';

const TeacherRegisterTeacher = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [functional, setFunctional] = useState(''); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (!name || !functional || !email || !password) {
        toast({ title: "Erro", description: "Nome, Funcional, Email e Senha são obrigatórios.", variant: "destructive" });
        return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    const teachers = getTeachers();
    if (teachers.some(t => t.functional === functional)) {
      toast({ title: "Erro", description: "Já existe um professor com este funcional.", variant: "destructive" });
      return;
    }
    if (getUsers().some(u => u.username === functional)) {
        toast({ title: "Erro", description: "Este nome de usuário (funcional) já está em uso.", variant: "destructive" });
        return;
    }


    const newTeacherId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTeacher = {
      id: newTeacherId,
      name,
      functional,
      email,
      phone,
      subjectIds: [], 
    };

    const newUser = {
      id: `user_t_${Date.now()}`,
      username: functional, 
      password,
      role: 'teacher',
      entityId: newTeacherId,
      mustChangePassword: true, // Force password change on first login
    };

    setTeachers([...teachers, newTeacher]);
    setUsers([...getUsers(), newUser]);

    toast({ title: "Sucesso!", description: `Professor "${name}" cadastrado. O professor deverá alterar a senha no primeiro login.`, className: "bg-green-600 border-green-700 text-white" });
    setName(''); setFunctional(''); setEmail(''); setPhone(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary text-2xl flex items-center">
          <Briefcase className="mr-2 h-6 w-6" /> Cadastrar Novo Professor
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Preencha os dados para registrar um novo professor. A senha inicial deverá ser alterada no primeiro login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="teacher-name" className="text-foreground">Nome Completo</Label>
              <Input id="teacher-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do Professor" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="teacher-functional" className="text-foreground">Funcional (Login)</Label>
              <Input id="teacher-functional" value={functional} onChange={(e) => setFunctional(e.target.value)} placeholder="Ex: T00123" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="teacher-email" className="text-foreground">Email</Label>
              <Input id="teacher-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="professor@escola.com" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="teacher-phone" className="text-foreground">Telefone</Label>
              <Input id="teacher-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="bg-input border-input-border focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="teacher-password" className="text-foreground">Senha Inicial de Acesso</Label>
              <Input id="teacher-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha forte (mín. 6 caracteres)" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="teacher-confirm-password" className="text-foreground">Confirmar Senha Inicial</Label>
              <Input id="teacher-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="bg-input border-input-border focus:border-primary" required />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-yellow-400">
            <UserPlus className="mr-2 h-5 w-5" /> Cadastrar Professor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherRegisterTeacher;