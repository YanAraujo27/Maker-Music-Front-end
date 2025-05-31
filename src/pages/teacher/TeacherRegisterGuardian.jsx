import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getGuardians, setGuardians, getUsers, setUsers } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, ShieldCheck } from 'lucide-react';

const TeacherRegisterGuardian = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (!name || !email || !password) {
        toast({ title: "Erro", description: "Nome, Email e Senha são obrigatórios.", variant: "destructive" });
        return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    const guardians = getGuardians();
    if (guardians.some(g => g && g.email && g.email.toLowerCase() === email.toLowerCase())) {
      toast({ title: "Erro", description: "Já existe um responsável com este email.", variant: "destructive" });
      return;
    }
    if (getUsers().some(u => u && u.username && u.username.toLowerCase() === email.toLowerCase())) {
        toast({ title: "Erro", description: "Este email (nome de usuário) já está em uso.", variant: "destructive" });
        return;
    }

    const newGuardianId = `guardian_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newGuardian = {
      id: newGuardianId,
      name,
      email,
      address,
      phone,
      studentIds: [], 
    };

    const newUser = {
      id: `user_g_${Date.now()}`,
      username: email, 
      password,
      role: 'guardian',
      entityId: newGuardianId,
      mustChangePassword: true,
    };

    setGuardians([...guardians, newGuardian]);
    setUsers([...getUsers(), newUser]);

    toast({ title: "Sucesso!", description: `Responsável "${name}" cadastrado. O responsável deverá alterar a senha no primeiro login.`, className: "bg-green-600 border-green-700 text-white" });
    setName(''); setEmail(''); setAddress(''); setPhone(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary text-2xl flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6" /> Cadastrar Novo Responsável
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Preencha os dados para registrar um novo responsável. A senha inicial deverá ser alterada no primeiro login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="guardian-name" className="text-foreground">Nome Completo</Label>
              <Input id="guardian-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do Responsável" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="guardian-email" className="text-foreground">Email (Login)</Label>
              <Input id="guardian-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="responsavel@email.com" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="guardian-address" className="text-foreground">Endereço</Label>
              <Input id="guardian-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua Exemplo, 123, Cidade" className="bg-input border-input-border focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="guardian-phone" className="text-foreground">Telefone</Label>
              <Input id="guardian-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="bg-input border-input-border focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="guardian-password" className="text-foreground">Senha Inicial de Acesso</Label>
              <Input id="guardian-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha forte (mín. 6 caracteres)" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="guardian-confirm-password" className="text-foreground">Confirmar Senha Inicial</Label>
              <Input id="guardian-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="bg-input border-input-border focus:border-primary" required />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-yellow-400">
            <UserPlus className="mr-2 h-5 w-5" /> Cadastrar Responsável
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherRegisterGuardian;