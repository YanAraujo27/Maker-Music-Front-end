import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, UserCircle, LayoutDashboard, Home, Settings, Menu, X, Music2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, entityData, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/50471f55-a4f0-420c-88c5-9ed9c934e78e/35294a5d90066e8fcf4dc678467d76bc.png";
  const smallLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/50471f55-a4f0-420c-88c5-9ed9c934e78e/85fad80f75746bc80f597d83786c3f62.png";


  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const dashboardPath = isAuthenticated ? `/${user.role}-dashboard` : '/';

  const navLinks = [
    { to: "/", label: "Início", icon: <Home className="mr-2 h-5 w-5" /> },
  ];

  if (isAuthenticated && user.role === 'teacher') {
    navLinks.push({ to: "/teacher-dashboard/manage-subjects", label: "Gerenciar Matérias", icon: <Music2 className="mr-2 h-5 w-5" /> });
  }


  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="bg-black text-white shadow-md shadow-primary/30 sticky top-0 z-50 border-b border-primary/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center text-primary hover:text-yellow-400 transition-colors">
            <img src={logoUrl} alt="Maker Music Logo" className="h-12 md:h-16 mr-2 object-contain" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(link => (
              <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary" asChild key={link.to}>
                <Link to={link.to}>
                  {link.icon} {link.label}
                </Link>
              </Button>
            ))}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/20 p-0">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png?text=${getInitials(entityData?.name || user.username)}`} alt={entityData?.name || user.username} />
                      <AvatarFallback className="bg-black text-primary font-semibold">
                        {getInitials(entityData?.name || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-primary/50 text-card-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{entityData?.name || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.role === 'student' ? 'Aluno' : user.role === 'teacher' ? 'Professor' : 'Responsável'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/30"/>
                  <DropdownMenuItem asChild className="focus:bg-primary/20 focus:text-primary cursor-pointer">
                    <Link to={dashboardPath} className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Meu Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/20 focus:text-red-400 cursor-pointer flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-primary text-primary-foreground hover:bg-yellow-400" asChild>
                <Link to="/login">
                  <UserCircle className="mr-2 h-5 w-5" /> Entrar
                </Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground hover:bg-primary/10 hover:text-primary">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black border-t border-primary/30"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link to="/" className="flex items-center justify-center py-2 text-primary hover:text-yellow-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <img src={smallLogoUrl} alt="Maker Music Mini Logo" className="h-10 mr-2 object-contain" />
            </Link>
            {navLinks.map(link => (
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10 hover:text-primary" asChild key={link.to}>
                <Link to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  {link.icon} {link.label}
                </Link>
              </Button>
            ))}
            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10 hover:text-primary" asChild>
                  <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Meu Painel
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/20 hover:text-red-400">
                  <LogOut className="mr-2 h-5 w-5" /> Sair
                </Button>
              </>
            ) : (
              <Button className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 mt-2" asChild>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <UserCircle className="mr-2 h-5 w-5" /> Entrar
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;