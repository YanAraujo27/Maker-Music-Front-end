import React from 'react';
import { motion } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users, BookOpen, MessageSquare as MessageSquareIcon, Send, Briefcase } from 'lucide-react';
import { getStudents, getGrades, getComments, getTeacherById, getTeachers, setComments as saveNewComment, getSubjectById, getUsers, getStudentById } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";

const GuardianDashboardPage = () => {
  const { user: guardianUser, entityData: guardianEntity } = useAuth();
  const { toast } = useToast();
  const [activeStudentForChat, setActiveStudentForChat] = React.useState(null); 
  const [activeTeacherForChat, setActiveTeacherForChat] = React.useState(null); 
  const [chatMessages, setChatMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [selectedTeacherIdForNewChat, setSelectedTeacherIdForNewChat] = React.useState("SELECT_PLACEHOLDER");
  const [selectedStudentIdForNewChat, setSelectedStudentIdForNewChat] = React.useState("SELECT_PLACEHOLDER");

  const allUsers = getUsers();
  
  const supervisedStudents = React.useMemo(() => {
    if (!guardianEntity || !guardianEntity.studentIds) return [];
    return getStudents().filter(student => guardianEntity.studentIds.includes(student.id));
  }, [guardianEntity]);

  const teachersOfSupervisedStudents = React.useMemo(() => {
    if (!supervisedStudents || supervisedStudents.length === 0) return [];
    const teacherIds = new Set();
    supervisedStudents.forEach(student => {
      student.teacherIds?.forEach(id => teacherIds.add(id));
    });
    return getTeachers().filter(teacher => teacherIds.has(teacher.id));
  }, [supervisedStudents]);

  if (!guardianUser || !guardianEntity) {
    return <div className="text-center p-8 text-foreground">Carregando dados do responsável...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const loadChatMessages = (studentEntity, teacherEntity) => {
    if (!studentEntity || !teacherEntity) {
        setChatMessages([]);
        return;
    }
    const teacherUserRecord = allUsers.find(u => u.entityId === teacherEntity.id && u.role === 'teacher');
    if (!teacherUserRecord) {
        setChatMessages([]);
        return;
    }
    const existingMessages = getComments().filter(
      c => c.studentId === studentEntity.id && 
           c.teacherId === teacherEntity.id && 
           c.type === 'chat' &&
           ((c.authorId === guardianUser.id && c.targetUserId === teacherUserRecord.id) || 
            (c.authorId === teacherUserRecord.id && c.targetUserId === guardianUser.id))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    setChatMessages(existingMessages);
  };

  const handleStartChatWithTeacher = (studentId, teacherId) => {
    const studentEntity = getStudentById(studentId);
    const teacherEntity = getTeacherById(teacherId);

    if (studentEntity && teacherEntity) {
      setActiveStudentForChat(studentEntity);
      setActiveTeacherForChat(teacherEntity);
      loadChatMessages(studentEntity, teacherEntity);
      setSelectedStudentIdForNewChat(studentId);
      setSelectedTeacherIdForNewChat(teacherId);
      
      const chatTabTrigger = document.querySelector('[data-radix-collection-item][value="chat"]');
      if (chatTabTrigger && typeof chatTabTrigger.click === 'function') {
        chatTabTrigger.click();
      }
    } else {
        toast({ title: "Erro", description: "Não foi possível encontrar o aluno ou professor.", variant: "destructive"});
    }
  };

  const handleGuardianSendMessage = () => {
    if (!newMessage.trim() || !activeTeacherForChat || !activeStudentForChat) return;
    
    const teacherUserRecord = allUsers.find(u => u.entityId === activeTeacherForChat.id && u.role === 'teacher');
    if (!teacherUserRecord) {
        toast({ title: "Erro", description: "Professor não encontrado para enviar a mensagem.", variant: "destructive"});
        return;
    }

    const newComment = {
      id: `msg_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: activeStudentForChat.id,
      teacherId: activeTeacherForChat.id,
      comment: newMessage,
      date: new Date().toISOString(),
      authorId: guardianUser.id, 
      targetUserId: teacherUserRecord.id,
      type: 'chat', 
    };

    const allComments = getComments();
    saveNewComment([...allComments, newComment]);
    setChatMessages(prev => [...prev, newComment].sort((a,b) => new Date(a.date) - new Date(b.date)));
    setNewMessage("");
    toast({ title: "Mensagem Enviada!", description: `Sua mensagem sobre ${activeStudentForChat.name} foi enviada para ${activeTeacherForChat.name}.`, className: "bg-green-600 border-green-700 text-white"});
    
    setTimeout(() => {
        toast({
            title: "Notificação (Simulação)",
            description: `O professor ${activeTeacherForChat.name} seria notificado sobre sua nova mensagem. (Email: ${activeTeacherForChat.email}, Tel: ${activeTeacherForChat.phone || 'N/A'})`,
            duration: 7000,
            className: "bg-blue-600 border-blue-700 text-white"
        });
    }, 1000);
  };


  return (
    <motion.div 
      className="container mx-auto p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-4xl font-bold mb-8 text-primary"
        variants={itemVariants}
      >
        Painel do Responsável: <span className="text-foreground">{guardianEntity.name}</span>
      </motion.h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-2 mb-6 bg-card border border-primary/30 p-1.5 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Visão Geral</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Chat com Professores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><Users className="mr-3 h-7 w-7" />Alunos Vinculados</CardTitle>
                <CardDescription className="text-muted-foreground">Acompanhe o progresso dos alunos sob sua responsabilidade.</CardDescription>
              </CardHeader>
              <CardContent>
                {supervisedStudents.length > 0 ? (
                  <ul className="space-y-3">
                    {supervisedStudents.map(student => (
                      <li key={student.id} className="p-4 bg-background/50 border border-primary/20 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="mr-3 h-6 w-6 text-yellow-400" />
                          <div>
                            <p className="font-semibold text-lg text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Turma: {getStudentById(student.id)?.classId ? getStudentById(student.id)?.classId : 'Não especificada'}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum aluno vinculado encontrado.</p>
                )}
              </CardContent>
            </Card>

            {supervisedStudents.map(student => {
              const studentGrades = getGrades().filter(grade => grade.studentId === student.id);
              const studentCommentsFromTeachers = getComments().filter(comment => comment.studentId === student.id && comment.teacherId && comment.type === 'feedback');

              return (
                <motion.div key={student.id} className="mb-8 p-6 glassmorphic rounded-xl" variants={itemVariants}>
                  <h2 className="text-3xl font-semibold mb-6 text-yellow-400 border-b-2 border-primary/50 pb-2">Progresso de {student.name}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card/50 border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center"><BookOpen className="mr-2 h-5 w-5" />Notas Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {studentGrades.length > 0 ? (
                          <ul className="space-y-2">
                            {studentGrades.slice(0, 5).map(grade => {
                              const subject = getSubjectById(grade.subjectId);
                              return (
                                <li key={grade.id} className="flex justify-between items-center p-3 bg-background/70 rounded shadow">
                                  <span className="text-foreground">{subject ? subject.name : 'Matéria'} ({new Date(grade.date).toLocaleDateString()}):</span>
                                  <span className={`font-bold text-lg ${parseFloat(grade.grade) >= 7 ? 'text-green-400' : parseFloat(grade.grade) >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>{grade.grade}</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">Nenhuma nota registrada.</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-card/50 border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center"><MessageSquareIcon className="mr-2 h-5 w-5" />Comentários dos Professores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {studentCommentsFromTeachers.length > 0 ? (
                          <ul className="space-y-3">
                            {studentCommentsFromTeachers.slice(0, 3).map(comment => (
                              <li key={comment.id} className="p-3 bg-background/70 rounded shadow">
                                <p className="text-foreground text-sm">{comment.comment}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Por: {getTeacherById(comment.teacherId)?.name || 'Professor'} em {new Date(comment.date).toLocaleDateString()}
                                </p>
                                <Button variant="link" size="sm" className="text-primary p-0 h-auto mt-1" onClick={() => handleStartChatWithTeacher(student.id, comment.teacherId)}>
                                  Responder/Ver Chat
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">Nenhum comentário de professores.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="chat">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><MessageSquareIcon className="mr-2" />Chat com Professores</CardTitle>
                <CardDescription className="text-muted-foreground">Converse com os professores dos seus filhos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
                    <div>
                        <Label htmlFor="select-student-chat" className="text-foreground">Aluno</Label>
                        <Select 
                            value={selectedStudentIdForNewChat} 
                            onValueChange={(studentId) => {
                                setSelectedStudentIdForNewChat(studentId);
                                if (studentId !== "SELECT_PLACEHOLDER" && selectedTeacherIdForNewChat !== "SELECT_PLACEHOLDER") {
                                    handleStartChatWithTeacher(studentId, selectedTeacherIdForNewChat);
                                } else {
                                    setActiveStudentForChat(null);
                                    setActiveTeacherForChat(null);
                                    setChatMessages([]);
                                }
                            }}
                        >
                            <SelectTrigger id="select-student-chat" className="bg-input border-input-border focus:border-primary text-foreground">
                                <SelectValue placeholder="Selecione o Aluno" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary/50 text-card-foreground">
                                <SelectItem value="SELECT_PLACEHOLDER" disabled>Selecione o Aluno...</SelectItem>
                                {supervisedStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="select-teacher-chat" className="text-foreground">Professor</Label>
                        <Select 
                            value={selectedTeacherIdForNewChat} 
                            onValueChange={(teacherId) => {
                                setSelectedTeacherIdForNewChat(teacherId);
                                if (teacherId !== "SELECT_PLACEHOLDER" && selectedStudentIdForNewChat !== "SELECT_PLACEHOLDER") {
                                    handleStartChatWithTeacher(selectedStudentIdForNewChat, teacherId);
                                } else {
                                    setActiveStudentForChat(null);
                                    setActiveTeacherForChat(null);
                                    setChatMessages([]);
                                }
                            }}
                        >
                            <SelectTrigger id="select-teacher-chat" className="bg-input border-input-border focus:border-primary text-foreground">
                                <SelectValue placeholder="Selecione o Professor" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary/50 text-card-foreground">
                                <SelectItem value="SELECT_PLACEHOLDER" disabled>Selecione o Professor...</SelectItem>
                                {teachersOfSupervisedStudents.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!activeTeacherForChat || !activeStudentForChat ? (
                  <div>
                    <p className="mb-4 text-muted-foreground text-center">Selecione um aluno e um professor acima para iniciar ou visualizar uma conversa.</p>
                     <img  alt="Ilustração de chat para responsáveis selecionarem professor e aluno" className="w-1/2 md:w-1/3 mx-auto opacity-60" src="https://images.unsplash.com/photo-1580582932707-520769456151" />
                  </div>
                ) : (
                  <div className="flex flex-col h-[500px]">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Conversa com {activeTeacherForChat.name} sobre {activeStudentForChat.name}</h3>
                    <ScrollArea className="flex-grow p-4 border border-primary/20 rounded-lg bg-background/70 mb-4 h-96">
                      {chatMessages.length > 0 ? chatMessages.map(msg => (
                        <div key={msg.id} className={`mb-3 p-3 rounded-lg max-w-[70%] ${msg.authorId === guardianUser.id ? 'bg-primary/80 text-primary-foreground ml-auto text-right' : 'bg-card/80 text-card-foreground mr-auto'}`}>
                          <p className="text-sm">{msg.comment}</p>
                          <p className={`text-xs mt-1 ${msg.authorId === guardianUser.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{new Date(msg.date).toLocaleString()}</p>
                        </div>
                      )) : <p className="text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Comece a conversa!</p>}
                    </ScrollArea>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="text" 
                        placeholder="Digite sua mensagem..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGuardianSendMessage()}
                        className="bg-input border-input-border focus:border-primary"
                      />
                      <Button onClick={handleGuardianSendMessage} className="bg-primary text-primary-foreground hover:bg-yellow-400">
                        <Send className="h-5 w-5"/>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default GuardianDashboardPage;