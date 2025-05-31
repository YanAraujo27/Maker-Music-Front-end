import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getStudents, getClasses, getSubjects, getClassById, getTeacherById } from '@/lib/storage';
import useAuth from '@/hooks/useAuth';
import { Users } from 'lucide-react';

const TeacherManageStudents = () => {
  const { user, entityData: teacher } = useAuth(); 
  
  if (!teacher) {
    return <div className="text-center p-8 text-foreground">Carregando dados do professor...</div>;
  }

  const allStudents = getStudents();
  const allClasses = getClasses();
  const allSubjects = getSubjects();

  const subjectsTaughtByTeacher = allSubjects.filter(subject => subject.teacherId === teacher.id);
  const subjectIdsTaughtByTeacher = subjectsTaughtByTeacher.map(subject => subject.id);

  const classesWithTeacherSubjects = allClasses.filter(c => 
    c.subjectIds?.some(subjectIdInClass => subjectIdsTaughtByTeacher.includes(subjectIdInClass))
  );
  const classIdsWithTeacherSubjects = classesWithTeacherSubjects.map(c => c.id);

  const studentsInTeacherClasses = allStudents.filter(student => 
    student.classIds?.some(studentClassId => classIdsWithTeacherSubjects.includes(studentClassId))
  );

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="text-primary text-2xl flex items-center">
            <Users className="mr-2 h-6 w-6"/> Alunos Lecionados
        </CardTitle>
        <CardDescription className="text-muted-foreground">
            Visualize os alunos das turmas onde você leciona matérias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentsInTeacherClasses.length > 0 ? (
          <div className="space-y-4">
            {studentsInTeacherClasses.map(student => {
              const studentClasses = student.classIds
                ?.map(cid => getClassById(cid))
                .filter(c => c && classIdsWithTeacherSubjects.includes(c.id)) 
                .map(c => c.name)
                .join(', ');

              return (
                <Card key={student.id} className="bg-card/60 border-primary/20 shadow-sm p-4">
                  <p className="font-semibold text-lg text-yellow-400">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Matrícula: {student.functional}</p>
                  <p className="text-sm text-muted-foreground">Email: {student.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Turmas (com suas matérias): {studentClasses || 'N/A'}
                  </p>
                </Card>
              );
            })}
          </div>
        ) : <p className="text-muted-foreground text-center py-8">Nenhum aluno encontrado nas turmas onde você leciona matérias.</p>}
      </CardContent>
    </Card>
  );
};

export default TeacherManageStudents;