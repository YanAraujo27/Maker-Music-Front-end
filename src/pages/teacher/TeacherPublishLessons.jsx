import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from 'lucide-react';
import { getLessons, setLessons, getSubjects } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import useAuth from '@/hooks/useAuth';

const TeacherPublishLessons = () => {
  const { entityData } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [externalLink, setExternalLink] = useState('');
  
  const availableSubjects = getSubjects();

  const handlePublishLesson = (e) => {
    e.preventDefault();
    if(!title || !content || !selectedSubjectId) {
      toast({ title: "Erro", description: "Título, conteúdo e matéria são obrigatórios.", variant: "destructive"});
      return;
    }
    const newLesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      content,
      subjectId: selectedSubjectId,
      externalLink: externalLink || null,
      date: new Date().toISOString(),
      teacherId: entityData.id,
    };
    const allLessons = getLessons();
    setLessons([...allLessons, newLesson]);
    toast({ title: "Sucesso!", description: `Lição "${title}" publicada.`, className: "bg-green-600 border-green-700 text-white" });
    setTitle(''); setContent(''); setSelectedSubjectId(''); setExternalLink('');
  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary">Publicar Nova Lição/Material</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePublishLesson} className="space-y-6">
          <div>
            <Label htmlFor="lesson-title-input" className="text-foreground">Título</Label>
            <Input id="lesson-title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Introdução à Cinemática" className="bg-input border-input-border focus:border-primary" />
          </div>
           <div>
            <Label htmlFor="lesson-subject-select" className="text-foreground mb-1 block">Matéria</Label>
            <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
              <SelectTrigger id="lesson-subject-select" className="bg-input border-input-border focus:border-primary text-foreground w-full">
                <SelectValue placeholder="Selecione a Matéria" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/50 text-card-foreground">
                {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lesson-content-textarea" className="text-foreground">Conteúdo/Descrição</Label>
            <Textarea id="lesson-content-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Descreva a lição, adicione observações, etc." className="bg-input border-input-border focus:border-primary min-h-[120px]" />
          </div>
          <div>
            <Label htmlFor="lesson-link-input" className="text-foreground">Link Externo (Opcional)</Label>
            <Input id="lesson-link-input" type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} placeholder="https://exemplo.com/material-extra" className="bg-input border-input-border focus:border-primary" />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-yellow-400 w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4"/>Publicar Lição
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherPublishLessons;