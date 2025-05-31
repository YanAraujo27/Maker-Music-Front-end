import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getComments, setComments as saveNewComments } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import useAuth from '@/hooks/useAuth';

const TeacherSendComments = () => {
  const { entityData } = useAuth();
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [commentText, setCommentText] = useState('');
  
  const students = getStudents().filter(s => s.teacherIds?.includes(entityData.id));

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!selectedStudentId || !commentText.trim()) {
      toast({ title: "Erro", description: "Selecione um aluno e escreva um comentário.", variant: "destructive"});
      return;
    }

    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: selectedStudentId,
      teacherId: entityData.id, 
      comment: commentText,
      date: new Date().toISOString(),
      authorId: entityData.id, // Teacher is the author
      type: 'feedback', // Differentiate from chat or other types
    };

    const allComments = getComments();
    saveNewComments([...allComments, newComment]);
    toast({ title: "Sucesso!", description: "Comentário enviado para o aluno.", className: "bg-green-600 border-green-700 text-white" });
    setSelectedStudentId('');
    setCommentText('');
  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary">Enviar Comentários/Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendComment} className="space-y-6">
          <div>
            <Label htmlFor="student-comment-select" className="text-foreground mb-1 block">Aluno</Label>
            <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
              <SelectTrigger id="student-comment-select" className="bg-input border-input-border focus:border-primary text-foreground w-full">
                <SelectValue placeholder="Selecione o Aluno para enviar feedback" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/50 text-card-foreground">
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="comment-text-area" className="text-foreground">Comentário</Label>
            <Textarea 
              id="comment-text-area" 
              value={commentText} 
              onChange={e => setCommentText(e.target.value)} 
              placeholder="Escreva seu feedback para o aluno aqui..." 
              className="bg-input border-input-border focus:border-primary min-h-[120px]" 
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-yellow-400 w-full sm:w-auto">Enviar Comentário</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherSendComments;