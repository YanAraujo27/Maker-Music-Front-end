import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, UserPlus, BookCopy, Edit3, MessageCircle, ListChecks, Send, Eye, BookMarked, ChevronRight, Home, ShieldCheck, Briefcase, LayoutDashboard } from 'lucide-react';
import { getStudents } from '@/lib/storage';
import { cn } from '@/lib/utils';

const TeacherDashboardPage = () => {
  const { user, entityData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || !entityData) {
    return <div className="text-center p-8 text-foreground">Carregando dados do professor...</div>;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const teacherStudents = getStudents().filter(s => s.teacherIds?.includes(user.entityId));

  const menuItems = [
    { title: "Painel Principal", icon: <Home/>, link: "/teacher-dashboard", exact: true },
    { title: "Gerenciar Alunos", icon: <Users/>, link: "manage-students", count: teacherStudents.length },
    { title: "Cadastrar Aluno", icon: <UserPlus/>, link: "register-student" },
    { title: "Cadastrar Responsável", icon: <ShieldCheck/>, link: "register-guardian" },
    { title: "Cadastrar Professor", icon: <Briefcase/>, link: "register-teacher" },
    { title: "Gerenciar Turmas", icon: <ListChecks/>, link: "manage-classes" },
    { title: "Gerenciar Matérias", icon: <BookMarked/>, link: "manage-subjects" },
    { title: "Lançar Notas", icon: <Edit3/>, link: "assign-grades" },
    { title: "Publicar Lições", icon: <BookCopy/>, link: "publish-lessons" },
    { title: "Enviar Comentários", icon: <MessageCircle/>, link: "send-comments" },
    { title: "Visualizar Conteúdo", icon: <Eye/>, link: "view-content" },
    { title: "Chat", icon: <Send/>, link: "chat" },
  ];

  const SidebarContent = () => (
    <div className="p-4 space-y-2">
      {menuItems.map((item) => {
        const isActive = item.exact ? location.pathname === item.link : location.pathname.startsWith(item.link === "/teacher-dashboard" ? item.link : `/teacher-dashboard/${item.link}`);
        return (
          <Button
            key={item.title}
            variant="ghost"
            className={cn(
              "w-full justify-start text-base py-3 px-4",
              isActive ? "bg-primary/20 text-primary font-semibold" : "text-foreground hover:bg-primary/10 hover:text-primary"
            )}
            onClick={() => {
              navigate(item.link);
              setSidebarOpen(false);
            }}
          >
            {React.cloneElement(item.icon, { className: "mr-3 h-5 w-5" })}
            {item.title}
            {item.count !== undefined && <span className="ml-auto text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full">{item.count}</span>}
          </Button>
        );
      })}
    </div>
  );


  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]"> {/* Adjust min-h based on Navbar height */}
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 border-b border-primary/20">
        <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="outline" className="border-primary text-primary">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="ml-2">Menu Professor</span>
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-primary/30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block",
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : '-100%' }} // window.innerWidth check for initial desktop load
        transition={{ type: 'tween' }}
      >
        <div className="sticky top-0 h-screen overflow-y-auto"> {/* Make sidebar scrollable if content overflows */}
           <div className="p-5 border-b border-primary/20">
            <Link to="/teacher-dashboard" className="text-2xl font-bold text-primary flex items-center">
              <LayoutDashboard className="mr-2 h-7 w-7"/> Painel
            </Link>
          </div>
          <SidebarContent />
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto"> {/* Make main content scrollable */}
        <motion.div
          key={location.pathname} // Animate on route change
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Outlet context={{ user, entityData }} />
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherDashboardPage;