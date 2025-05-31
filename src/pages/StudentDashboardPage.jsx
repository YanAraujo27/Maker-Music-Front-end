import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { BookText, MessageSquare as MessageSquareText, Users, FileText, Link as LinkIcon, Send } from 'lucide-react';
import { getGrades, getComments, getLessons, getTeachers, getTeacherById, setComments as saveNewComment, getSubjectById, getUsers } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";

const StudentDashboardPage = () => {
  const { user: studentUser, entityData: studentEntity } = useAuth();
  const { toast } = useToast();
  const [activeChatTeacher, setActiveChatTeacher] = useState(null); // Stores teacher entity
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  if (!studentUser || !studentEntity) {
    return <div className="text-center p-8 text-foreground">Carregando dados do aluno...</div>;
  }
  
  const studentGrades = getGrades().filter(grade => grade.studentId === studentUser.entityId);
  const studentLessons = getLessons().filter(lesson => studentEntity.teacherIds?.includes(lesson.teacherId) || lesson.class === studentEntity.class); 
  const teachers = getTeachers().filter(teacher => studentEntity.teacherIds?.includes(teacher.id));
  const allUsers = getUsers();

  const gradesBySubject = studentGrades.reduce((acc, grade) => {
    const subject = getSubjectById(grade.subjectId);
    const subjectName = subject ? subject.name : 'Matéria Desconhecida';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(grade);
    return acc;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const handleStartChat = (teacherEntity) => {
    setActiveChatTeacher(teacherEntity);
    const teacherUserRecord = allUsers.find(u => u.entityId === teacherEntity.id && u.role === 'teacher');
    if (!teacherUserRecord) {
        setChatMessages([]);
        return;
    }

    const existingMessages = getComments().filter(
      c => c.studentId === studentUser.entityId && 
           c.teacherId === teacherEntity.id && 
           c.type === 'chat' &&
           ((c.authorId === studentUser.id && c.targetUserId === teacherUserRecord.id) || 
            (c.authorId === teacherUserRecord.id && c.targetUserId === studentUser.id))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    setChatMessages(existingMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatTeacher) return;

    const teacherUserRecord = allUsers.find(u => u.entityId === activeChatTeacher.id && u.role === 'teacher');
    if (!teacherUserRecord) {
        toast({ title: "Erro", description: "Professor não encontrado para enviar a mensagem.", variant: "destructive"});
        return;
    }

    const newComment = {
      id: `msg_s_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: studentUser.entityId,
      teacherId: activeChatTeacher.id,
      comment: newMessage,
      date: new Date().toISOString(),
      authorId: studentUser.id, 
      targetUserId: teacherUserRecord.id,
      type: 'chat', 
    };

    const allComments = getComments();
    saveNewComment([...allComments, newComment]);
    setChatMessages(prev => [...prev, newComment].sort((a,b) => new Date(a.date) - new Date(b.date)));
    setNewMessage("");
    toast({ title: "Mensagem Enviada!", description: "Sua mensagem foi enviada para o professor.", className: "bg-green-600 border-green-700 text-white"});
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
        Painel do Aluno: <span className="text-foreground">{studentEntity.name}</span>
      </motion.h1>
      
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6 bg-card border border-primary/30 p-1.5 rounded-lg">
          <TabsTrigger value="grades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Notas</TabsTrigger>
          <TabsTrigger value="lessons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Lições e Materiais</TabsTrigger>
          <TabsTrigger value="teachers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Professores</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><BookText className="mr-2" /> Minhas Notas</CardTitle>
                <CardDescription className="text-muted-foreground">Visualize suas notas por matéria e período.</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(gradesBySubject).length > 0 ? (
                  Object.entries(gradesBySubject).map(([subjectName, grades]) => (
                    <div key={subjectName} className="mb-6 p-4 border border-primary/20 rounded-lg bg-card/50">
                      <h3 className="text-xl font-semibold text-primary mb-2">{subjectName}</h3>
                      <ul className="space-y-2">
                        {grades.map(grade => (
                          <li key={grade.id} className="flex justify-between items-center p-3 bg-background/50 rounded-md shadow-sm">
                            <div>
                              <p className="font-medium text-foreground">Avaliação de {new Date(grade.date).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">Professor: {getTeacherById(grade.teacherId)?.name || 'N/A'}</p>
                            </div>
                            <span className={`text-2xl font-bold ${parseFloat(grade.grade) >= 7 ? 'text-green-400' : parseFloat(grade.grade) >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>{grade.grade}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma nota registrada ainda.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="lessons">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><FileText className="mr-2" />Lições e Materiais Bônus</CardTitle>
                <CardDescription className="text-muted-foreground">Acesse os materiais e links compartilhados pelos professores.</CardDescription>
              </CardHeader>
              <CardContent>
                {studentLessons.length > 0 ? (
                  <ul className="space-y-4">
                    {studentLessons.map(lesson => {
                      const subject = getSubjectById(lesson.subjectId);
                      return (
                        <li key={lesson.id} className="p-4 border border-primary/20 rounded-lg bg-card/50">
                          <h4 className="text-lg font-semibold text-primary mb-1">{lesson.title} ({subject ? subject.name : 'Matéria Desconhecida'})</h4>
                          <p className="text-xs text-muted-foreground mb-2">Publicado em: {new Date(lesson.date).toLocaleDateString()} por {getTeacherById(lesson.teacherId)?.name || 'N/A'}</p>
                          <p className="text-sm text-foreground mb-2">{lesson.content}</p>
                          {lesson.externalLink && (
                            <a href={lesson.externalLink} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 flex items-center text-sm">
                              <LinkIcon className="mr-1 h-4 w-4"/> Link Externo
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhuma lição ou material disponível no momento.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="teachers">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><Users className="mr-2" />Meus Professores</CardTitle>
                <CardDescription className="text-muted-foreground">Informações dos professores que ministram suas matérias.</CardDescription>
              </CardHeader>
              <CardContent>
                 {teachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map(teacher => {
                      const teacherSubjects = Array.isArray(teacher.subjectIds) 
                        ? teacher.subjectIds.map(id => getSubjectById(id)?.name).filter(Boolean) 
                        : [];
                      return (
                        <div key={teacher.id} className="p-4 border border-primary/20 rounded-lg bg-card/50">
                          <h4 className="text-lg font-semibold text-primary">{teacher.name}</h4>
                          <p className="text-sm text-muted-foreground">Matérias: {teacherSubjects.join(', ') || 'Nenhuma matéria especificada'}</p>
                          <Button variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary/10" onClick={() => { handleStartChat(teacher); document.querySelector('[data-radix-collection-item][value="chat"]')?.click(); }}>
                            <MessageSquareText className="mr-2 h-4 w-4"/> Enviar Mensagem
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum professor vinculado no momento.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="chat">
          <motion.div variants={itemVariants}>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center"><MessageSquareText className="mr-2" />Chat com Professores</CardTitle>
                <CardDescription className="text-muted-foreground">Envie dúvidas e converse com seus professores.</CardDescription>
              </CardHeader>
              <CardContent>
                {!activeChatTeacher ? (
                  <div>
                    <p className="mb-4 text-muted-foreground">Selecione um professor na aba 'Professores' para iniciar uma conversa.</p>
                    <img  alt="Ilustração de balões de chat vazios" className="w-1/2 mx-auto opacity-50" src="https://images.unsplash.com/photo-1684835609054-dd3d681cf012" />
                  </div>
                ) : (
                  <div className="flex flex-col h-[500px]">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Conversa com: {activeChatTeacher.name}</h3>
                    <ScrollArea className="flex-grow p-4 border border-primary/20 rounded-lg bg-background/70 mb-4 h-96">
                       {chatMessages.length > 0 ? chatMessages.map(msg => (
                        <div key={msg.id} className={`mb-3 p-3 rounded-lg max-w-[70%] ${msg.authorId === studentUser.id ? 'bg-primary/80 text-primary-foreground ml-auto text-right' : 'bg-card/80 text-card-foreground mr-auto'}`}>
                          <p className="text-sm">{msg.comment}</p>
                          <p className={`text-xs mt-1 ${msg.authorId === studentUser.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{new Date(msg.date).toLocaleString()}</p>
                        </div>
                      )) : <p className="text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Comece a conversa!</p>}
                    </ScrollArea>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="text" 
                        placeholder="Digite sua mensagem..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-input border-input-border focus:border-primary"
                      />
                      <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-yellow-400">
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

export default StudentDashboardPage;