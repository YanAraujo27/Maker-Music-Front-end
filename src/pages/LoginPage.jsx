import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, UserPlus, AlertCircle, BookLock } from 'lucide-react';
import ChangePasswordModal from '@/components/ChangePasswordModal.jsx';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user: authUser } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = login(username, password); 
      if (loggedInUser) {
        if (loggedInUser.mustChangePassword) {
          setShowChangePasswordModal(true);
        } else {
          toast({
            title: "Login bem-sucedido!",
            description: `Bem-vindo(a) de volta! Redirecionando...`,
            variant: "default",
            className: "bg-green-600 border-green-700 text-white"
          });
          let redirectTo = from;
          if (from === "/" || from === "/login") {
             redirectTo = `/${loggedInUser.role}-dashboard`;
          }
          navigate(redirectTo, { replace: true });
        }
      } else {
        setError('Credenciais inválidas. Verifique seus dados e tente novamente.');
        toast({
          title: "Erro no Login",
          description: "Credenciais inválidas. Por favor, verifique e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
      toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro durante o login. Tente novamente mais tarde.",
          variant: "destructive",
        });
    }
  };

  const handlePasswordChanged = () => {
    setShowChangePasswordModal(false);
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso. Redirecionando...",
      className: "bg-green-600 border-green-700 text-white"
    });
    let redirectTo = from;
    if (from === "/" || from === "/login" || !authUser) { 
       redirectTo = authUser ? `/${authUser.role}-dashboard` : "/";
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl glassmorphic border-primary/50">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                className="mx-auto bg-primary p-4 rounded-full inline-block mb-6 shadow-lg"
              >
                <BookLock className="h-12 w-12 text-black" />
              </motion.div>
              <CardTitle className="text-4xl font-bold text-primary">
                Acesso ao Portal
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Utilize suas credenciais para entrar no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">Matrícula / Usuário / E-mail</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite sua credencial de acesso"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-input-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-input-border"
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-md flex items-center"
                  >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 font-semibold py-3 text-lg transform hover:scale-105 transition-transform duration-300 shadow-md"
                >
                  <LogIn className="mr-2 h-5 w-5" /> Entrar
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Problemas para acessar? {' '}
                <Link to="/support" className="font-medium text-primary hover:text-yellow-400 hover:underline">
                  Contate o suporte
                </Link>
              </p>
               <p className="text-xs text-muted-foreground/70">
                (Funcionalidade de registro não disponível publicamente)
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      {showChangePasswordModal && authUser && (
        <ChangePasswordModal
          userId={authUser.id}
          onPasswordChanged={handlePasswordChanged}
          onCancel={() => {
            setShowChangePasswordModal(false); 
            setError("Você precisa alterar sua senha para continuar.");
          }}
        />
      )}
    </>
  );
};

export default LoginPage;