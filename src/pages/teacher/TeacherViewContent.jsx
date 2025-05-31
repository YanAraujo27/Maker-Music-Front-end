import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLessons, getGrades, getComments, getStudentById, getSubjectById } from '@/lib/storage';
import { BookOpen, Edit3, MessageSquare, Link as LinkIcon } from 'lucide-react';
import useAuth from '@/hooks/useAuth';


const TeacherViewContent = () => {
  const { entityData } = useAuth();

  const lessons = getLessons().filter(l => l.teacherId === entityData.id);
  const grades = getGrades().filter(g => g.teacherId === entityData.id);
  const comments = getComments().filter(c => c.teacherId === entityData.id && c.type === 'feedback');

  return (
    <div className="space-y-6">
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="text-primary">Visualizar Conteúdo Publicado</CardTitle>
          <CardDescription className="text-muted-foreground">Revise as lições, notas e comentários que você publicou.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-2 mb-6 bg-card border border-primary/30 p-1.5 rounded-lg">
          <TabsTrigger value="lessons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Lições</TabsTrigger>
          <TabsTrigger value="grades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Notas Lançadas</TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Comentários Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card className="glassmorphic">
            <CardHeader><CardTitle className="text-primary flex items-center"><BookOpen className="mr-2"/>Lições Publicadas</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {lessons.length > 0 ? (
                  <ul className="space-y-4">
                    {lessons.map(lesson => {
                      const subject = getSubjectById(lesson.subjectId);
                      return (
                        <li key={lesson.id} className="p-4 border border-primary/20 rounded-lg bg-card/50">
                          <h4 className="text-lg font-semibold text-yellow-400 mb-1">{lesson.title} ({subject ? subject.name : 'Matéria não encontrada'})</h4>
                          <p className="text-xs text-muted-foreground mb-2">Publicado em: {new Date(lesson.date).toLocaleDateString()}</p>
                          <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">{lesson.content}</p>
                          {lesson.externalLink && (
                            <a href={lesson.externalLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-yellow-300 flex items-center text-sm">
                              <LinkIcon className="mr-1 h-4 w-4"/> Ver Link Externo
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="text-muted-foreground">Nenhuma lição publicada.</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card className="glassmorphic">
            <CardHeader><CardTitle className="text-primary flex items-center"><Edit3 className="mr-2"/>Notas Lançadas</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {grades.length > 0 ? (
                  <ul className="space-y-3">
                    {grades.map(grade => {
                      const student = getStudentById(grade.studentId);
                      const subject = getSubjectById(grade.subjectId);
                      return (
                        <li key={grade.id} className="p-3 bg-card/50 rounded-md shadow-sm border border-primary/10">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-foreground">{student ? student.name : 'Aluno não encontrado'}</p>
                              <p className="text-sm text-yellow-400">{subject ? subject.name : 'Matéria não encontrada'}</p>
                            </div>
                            <span className={`text-xl font-bold ${parseFloat(grade.grade) >= 7 ? 'text-green-400' : parseFloat(grade.grade) >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>{grade.grade}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Data: {new Date(grade.date).toLocaleDateString()}</p>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="text-muted-foreground">Nenhuma nota lançada.</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card className="glassmorphic">
            <CardHeader><CardTitle className="text-primary flex items-center"><MessageSquare className="mr-2"/>Comentários Enviados (Feedback)</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {comments.length > 0 ? (
                  <ul className="space-y-3">
                    {comments.map(comment => {
                      const student = getStudentById(comment.studentId);
                      return (
                        <li key={comment.id} className="p-3 bg-card/50 rounded-md shadow-sm border border-primary/10">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{comment.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Para: <span className="font-medium text-yellow-400">{student ? student.name : 'Aluno não encontrado'}</span> | Data: {new Date(comment.date).toLocaleString()}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="text-muted-foreground">Nenhum comentário de feedback enviado.</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherViewContent;