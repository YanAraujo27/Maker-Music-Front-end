import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from 'lucide-react';
import { getStudents, getGuardians, getComments, setComments as saveNewComments, getGuardianById, getStudentById, getUsers, getTeacherById } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import useAuth from '@/hooks/useAuth';

const TeacherChat = () => {
  const { user: teacherUser, entityData: teacher } = useAuth(); 
  const { toast } = useToast();

  const [chatTarget, setChatTarget] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const allUsers = getUsers();
  const students = getStudents().filter(s => s.teacherIds?.includes(teacher.id));
  const studentIds = students.map(s => s.id);
  const guardians = getGuardians().filter(g => g.studentIds?.some(sid => studentIds.includes(sid)));

  const loadMessages = (target) => {
    let loadedMsgs = [];
    const allComments = getComments();

    if (target.type === 'student') {
      loadedMsgs = allComments.filter(
        c => c.teacherId === teacher.id && 
             c.studentId === target.id && 
             c.type === 'chat' &&
             ((c.authorId === teacherUser.id && c.targetUserId === target.originalStudentUserId) || 
              (c.authorId === target.originalStudentUserId && c.targetUserId === teacherUser.id))
      );
    } else { 
      const studentOfGuardian = getStudents().find(s => target.studentIds.includes(s.id) && s.teacherIds?.includes(teacher.id));
      if (studentOfGuardian) {
         loadedMsgs = allComments.filter(
          c => c.teacherId === teacher.id && 
               c.studentId === studentOfGuardian.id && 
               c.type === 'chat' &&
               ((c.authorId === teacherUser.id && c.targetUserId === target.originalGuardianUserId) ||
                (c.authorId === target.originalGuardianUserId && c.targetUserId === teacherUser.id))
        );
      }
    }
    setMessages(loadedMsgs.sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const handleSelectTarget = (value) => {
    if (value === 'SELECT_PLACEHOLDER') {
        setChatTarget(null);
        setMessages([]);
        return;
    }
    const [type, id] = value.split(':');
    let targetObj = null;
    if (type === 'student') {
      const student = getStudentById(id);
      const studentUserRecord = allUsers.find(u => u.entityId === id && u.role === 'student');
      targetObj = student ? { id, name: student.name, type, originalStudentUserId: studentUserRecord?.id } : null;
    } else {
      const guardian = getGuardianById(id);
      const guardianUserRecord = allUsers.find(u => u.entityId === id && u.role === 'guardian');
      targetObj = guardian ? { id, name: guardian.name, type, studentIds: guardian.studentIds, originalGuardianUserId: guardianUserRecord?.id, email: guardian.email, phone: guardian.phone } : null;
    }
    setChatTarget(targetObj);
    if (targetObj) {
      loadMessages(targetObj);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatTarget) return;

    let studentIdForMessage = '';
    let targetUserIdForMessage = '';
    let targetEntityForNotification = null;

    if (chatTarget.type === 'student') {
      studentIdForMessage = chatTarget.id;
      targetUserIdForMessage = chatTarget.originalStudentUserId;
      targetEntityForNotification = getStudentById(chatTarget.id);
    } else { 
      const studentOfGuardian = getStudents().find(s => chatTarget.studentIds.includes(s.id) && s.teacherIds?.includes(teacher.id));
      if (!studentOfGuardian) {
        toast({ title: "Erro", description: "Não foi possível associar o responsável a um aluno para este chat.", variant: "destructive"});
        return;
      }
      studentIdForMessage = studentOfGuardian.id;
      targetUserIdForMessage = chatTarget.originalGuardianUserId;
      targetEntityForNotification = getGuardianById(chatTarget.id);
    }
    
    if (!targetUserIdForMessage) {
        toast({ title: "Erro", description: "Destinatário da mensagem não encontrado.", variant: "destructive"});
        return;
    }

    const msg = {
      id: `chat_t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: studentIdForMessage, 
      teacherId: teacher.id,
      comment: newMessage,
      date: new Date().toISOString(),
      authorId: teacherUser.id, 
      targetUserId: targetUserIdForMessage, 
      type: 'chat',
    };
    
    const allComments = getComments();
    saveNewComments([...allComments, msg]);
    
    setMessages(prev => [...prev, msg].sort((a,b) => new Date(a.date) - new Date(b.date)));
    setNewMessage('');
    toast({ title: "Mensagem Enviada!", className: "bg-green-600 border-green-700 text-white"});

    if (targetEntityForNotification) {
      let notificationDetails = `(Email: ${targetEntityForNotification.email || 'N/A'}, Tel: ${targetEntityForNotification.phone || 'N/A'})`;
       if (chatTarget.type === 'student') { // Student doesn't have phone
           notificationDetails = `(Email: ${targetEntityForNotification.email || 'N/A'})`;
       }

      setTimeout(() => {
          toast({
              title: "Notificação (Simulação)",
              description: `${targetEntityForNotification.name} seria notificado sobre sua nova mensagem. ${notificationDetails}`,
              duration: 7000,
              className: "bg-blue-600 border-blue-700 text-white"
          });
      }, 1000);
    }
  };


  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary">Chat com Alunos e Responsáveis</CardTitle>
        <CardDescription className="text-muted-foreground">Selecione um aluno ou responsável para iniciar a conversa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select onValueChange={handleSelectTarget} defaultValue="SELECT_PLACEHOLDER">
            <SelectTrigger className="w-full md:w-[300px] bg-input border-input-border focus:border-primary text-foreground">
              <SelectValue placeholder="Selecione Aluno/Responsável" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/50 text-card-foreground">
              <SelectItem value="SELECT_PLACEHOLDER" disabled>Selecione...</SelectItem>
              {students.map(s => <SelectItem key={`student:${s.id}`} value={`student:${s.id}`}>Aluno: {s.name}</SelectItem>)}
              {guardians.map(g => <SelectItem key={`guardian:${g.id}`} value={`guardian:${g.id}`}>Responsável: {g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {chatTarget && (
          <div className="flex flex-col h-[500px] border border-primary/20 rounded-lg p-4 bg-background/30">
             <h3 className="text-xl font-semibold text-yellow-400 mb-3">Conversa com: {chatTarget.name}</h3>
            <ScrollArea className="flex-grow  mb-4 h-80 pr-2">
              {messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className={`mb-3 p-3 rounded-lg max-w-[70%] ${msg.authorId === teacherUser.id ? 'bg-primary/80 text-primary-foreground ml-auto text-right' : 'bg-card/80 text-card-foreground mr-auto'}`}>
                  <p className="text-sm">{msg.comment}</p>
                  <p className={`text-xs mt-1 ${msg.authorId === teacherUser.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{new Date(msg.date).toLocaleString()}</p>
                </div>
              )) : <p className="text-muted-foreground text-center py-10">Nenhuma mensagem. Comece a conversa!</p>}
            </ScrollArea>
            <div className="flex items-center space-x-2 pt-2 border-t border-primary/20">
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
        {!chatTarget && (
          <div className="text-center py-10 text-muted-foreground">
             <img  alt="Ilustração de balões de chat para professor" src="https://images.unsplash.com/photo-1504775775835-4e59a2745a69" />
            <p>Selecione um destinatário para visualizar ou iniciar uma conversa.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherChat;