import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getGrades, setGrades, getSubjects, getClasses, getClassById, getSubjectById } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import useAuth from '@/hooks/useAuth';

const TeacherAssignGrades = () => {
  const { entityData: teacher } = useAuth();
  const { toast } = useToast();
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [subjectsInClass, setSubjectsInClass] = useState([]);

  const classes = getClasses(); // All classes
  const allStudents = getStudents();
  const allSubjects = getSubjects();

  useEffect(() => {
    if (selectedClassId) {
      const classData = getClassById(selectedClassId);
      if (classData) {
        setStudentsInClass(allStudents.filter(s => classData.studentIds?.includes(s.id)));
        setSubjectsInClass(allSubjects.filter(s => classData.subjectIds?.includes(s.id)));
      } else {
        setStudentsInClass([]);
        setSubjectsInClass([]);
      }
    } else {
      setStudentsInClass([]);
      setSubjectsInClass([]);
    }
    setSelectedStudentId('');
    setSelectedSubjectId('');
  }, [selectedClassId, allStudents, allSubjects]);


  const handleAssignGrade = (e) => {
    e.preventDefault();
    if(!selectedStudentId || !selectedSubjectId || !gradeValue || !selectedClassId) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios (Turma, Aluno, Matéria e Nota).", variant: "destructive"});
      return;
    }
    const newGrade = {
      id: `grade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: selectedStudentId,
      subjectId: selectedSubjectId,
      grade: gradeValue,
      date,
      teacherId: teacher.id,
      classId: selectedClassId,
    };
    const allGrades = getGrades();
    setGrades([...allGrades, newGrade]);
    toast({ title: "Sucesso!", description: `Nota ${gradeValue} lançada para o aluno selecionado.`, className: "bg-green-600 border-green-700 text-white" });
    setSelectedStudentId(''); setSelectedSubjectId(''); setGradeValue(''); setSelectedClassId('');
    setDate(new Date().toISOString().split('T')[0]); // Reset date
  };

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary">Lançar Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssignGrade} className="space-y-6">
          <div>
            <Label htmlFor="class-select" className="text-foreground mb-1 block">Turma</Label>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger id="class-select" className="bg-input border-input-border focus:border-primary text-foreground w-full">
                <SelectValue placeholder="Selecione a Turma" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/50 text-card-foreground">
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && (
            <>
              <div>
                <Label htmlFor="student-grade-select" className="text-foreground mb-1 block">Aluno</Label>
                <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={!selectedClassId || studentsInClass.length === 0}>
                  <SelectTrigger id="student-grade-select" className="bg-input border-input-border focus:border-primary text-foreground w-full">
                    <SelectValue placeholder={studentsInClass.length > 0 ? "Selecione o Aluno" : "Nenhum aluno nesta turma"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/50 text-card-foreground">
                    {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject-grade-select" className="text-foreground mb-1 block">Matéria</Label>
                <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId} disabled={!selectedClassId || subjectsInClass.length === 0}>
                  <SelectTrigger id="subject-grade-select" className="bg-input border-input-border focus:border-primary text-foreground w-full">
                    <SelectValue placeholder={subjectsInClass.length > 0 ? "Selecione a Matéria" : "Nenhuma matéria nesta turma"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/50 text-card-foreground">
                    {subjectsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="grade-value-input" className="text-foreground">Nota</Label>
            <Input id="grade-value-input" type="number" step="0.1" min="0" max="10" value={gradeValue} onChange={e => setGradeValue(e.target.value)} placeholder="Ex: 8.5" className="bg-input border-input-border focus:border-primary" />
          </div>
          <div>
            <Label htmlFor="grade-date-input" className="text-foreground">Data da Avaliação</Label>
            <Input id="grade-date-input" type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-input border-input-border focus:border-primary" />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-yellow-400 w-full sm:w-auto">Lançar Nota</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherAssignGrades;