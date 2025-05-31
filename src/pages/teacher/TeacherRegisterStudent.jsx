import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, setStudents, getUsers, setUsers, getGuardians, getClasses, setClasses as saveClasses } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, AlertTriangle } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";


const TeacherRegisterStudent = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [functional, setFunctional] = useState(''); 
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedGuardianId, setSelectedGuardianId] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState([]); 

  const guardians = getGuardians();
  const classes = getClasses();

  useEffect(() => {
    if (guardians.length === 0 && selectedGuardianId === '') {
        setSelectedGuardianId('NO_GUARDIANS_AVAILABLE');
    }
  }, [guardians, selectedGuardianId]);

  const handleClassSelection = (classId) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (!name || !functional || !email || !startDate || !password || selectedClassIds.length === 0) {
      toast({ title: "Erro", description: "Nome, Matrícula, Email, Data de Início, Senha e pelo menos uma Turma são obrigatórios.", variant: "destructive" });
      return;
    }
    if (selectedGuardianId === '' || selectedGuardianId === 'NO_GUARDIANS_AVAILABLE') {
        toast({ title: "Erro", description: "Um responsável deve ser selecionado. Se não houver, cadastre um primeiro.", variant: "destructive" });
        return;
    }
     if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    const students = getStudents();
    if (students.some(s => s.functional === functional)) {
      toast({ title: "Erro", description: "Já existe um aluno com esta matrícula (funcional).", variant: "destructive" });
      return;
    }
    const currentUsers = getUsers();
    if (currentUsers.some(u => u.username === functional)) {
      toast({ title: "Erro", description: "Este nome de usuário (funcional) já está em uso.", variant: "destructive" });
      return;
    }

    const newStudentId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newStudent = {
      id: newStudentId,
      name,
      functional,
      email,
      startDate,
      guardianId: selectedGuardianId,
      classIds: selectedClassIds, 
    };

    const newUser = {
      id: `user_s_${Date.now()}`,
      username: functional, 
      password,
      role: 'student',
      entityId: newStudentId,
      mustChangePassword: true,
    };

    setStudents([...students, newStudent]);
    setUsers([...currentUsers, newUser]);

    const updatedClasses = classes.map(c => {
        if (selectedClassIds.includes(c.id)) {
            return { ...c, studentIds: [...(c.studentIds || []), newStudentId] };
        }
        return c;
    });
    saveClasses(updatedClasses);


    toast({ title: "Sucesso!", description: `Aluno "${name}" cadastrado. O aluno deverá alterar a senha no primeiro login.`, className: "bg-green-600 border-green-700 text-white" });
    setName(''); setFunctional(''); setEmail(''); setStartDate(new Date().toISOString().split('T')[0]); 
    setPassword(''); setConfirmPassword(''); setSelectedGuardianId(''); setSelectedClassIds([]);
    if (guardians.length === 0) setSelectedGuardianId('NO_GUARDIANS_AVAILABLE');

  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary text-2xl flex items-center">
          <UserPlus className="mr-2 h-6 w-6" /> Cadastrar Novo Aluno
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Preencha os dados para registrar um novo aluno. A senha inicial deverá ser alterada no primeiro login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="student-name" className="text-foreground">Nome Completo</Label>
              <Input id="student-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do Aluno" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="student-functional" className="text-foreground">Matrícula (Login do Aluno)</Label>
              <Input id="student-functional" value={functional} onChange={(e) => setFunctional(e.target.value)} placeholder="Ex: S00123" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="student-email" className="text-foreground">Email do Aluno</Label>
              <Input id="student-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aluno@escola.com" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="student-start-date" className="text-foreground">Data de Início</Label>
              <Input id="student-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="student-password" className="text-foreground">Senha Inicial de Acesso</Label>
              <Input id="student-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha forte (mín. 6 caracteres)" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <div>
              <Label htmlFor="student-confirm-password" className="text-foreground">Confirmar Senha Inicial</Label>
              <Input id="student-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="bg-input border-input-border focus:border-primary" required />
            </div>
            
            <div className="md:col-span-2">
              <Label className="text-foreground">Turmas (Selecione uma ou mais)</Label>
              {classes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border border-input rounded-md bg-input/50 max-h-40 overflow-y-auto">
                    {classes.map(c => (
                    <div key={c.id} className="flex items-center space-x-2">
                        <Checkbox
                        id={`class-${c.id}`}
                        checked={selectedClassIds.includes(c.id)}
                        onCheckedChange={() => handleClassSelection(c.id)}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor={`class-${c.id}`} className="text-foreground font-normal cursor-pointer">{c.name}</Label>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground p-2 border border-input rounded-md">Nenhuma turma cadastrada. Cadastre turmas primeiro.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="student-guardian" className="text-foreground">Responsável</Label>
              {guardians.length > 0 ? (
                <Select onValueChange={setSelectedGuardianId} value={selectedGuardianId}>
                  <SelectTrigger id="student-guardian" className="bg-input border-input-border focus:border-primary text-foreground">
                    <SelectValue placeholder="Selecione o Responsável" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/50 text-card-foreground">
                    {guardians.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-md flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p className="text-sm">Nenhum responsável cadastrado. Por favor, cadastre um responsável antes de prosseguir.</p>
                </div>
              )}
            </div>

          </div>
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-yellow-400"
            disabled={guardians.length === 0 || classes.length === 0}
          >
            <UserPlus className="mr-2 h-5 w-5" /> Cadastrar Aluno
          </Button>
           { (guardians.length === 0 || classes.length === 0) &&
            <p className="text-sm text-destructive mt-2">Cadastro de aluno desabilitado. É necessário ter pelo menos um responsável e uma turma cadastrados.</p>
          }
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherRegisterStudent;