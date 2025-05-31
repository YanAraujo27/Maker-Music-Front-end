import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { updateUserPassword } from '@/lib/storage';
import { KeyRound, ShieldAlert } from 'lucide-react';

const ChangePasswordModal = ({ userId, onPasswordChanged, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha ambos os campos de senha.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const success = updateUserPassword(userId, newPassword);
    if (success) {
      onPasswordChanged();
    } else {
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
      setError('Não foi possível atualizar sua senha. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl glassmorphic border-primary/70">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-full inline-block mb-4 shadow-lg">
            <KeyRound className="h-10 w-10 text-black" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Alterar Senha</CardTitle>
          <CardDescription className="text-muted-foreground">
            Por segurança, você precisa definir uma nova senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-foreground">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-input-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-foreground">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-input-border"
              />
            </div>
            {error && (
              <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-3 py-2.5 rounded-md flex items-center text-sm">
                <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 font-semibold py-2.5 text-md transform hover:scale-105 transition-transform duration-300 shadow-md"
            >
              Salvar Nova Senha
            </Button>
          </form>
        </CardContent>
        {onCancel && (
            <CardFooter>
                 <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground hover:text-primary">
                    Cancelar e Sair
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ChangePasswordModal;
