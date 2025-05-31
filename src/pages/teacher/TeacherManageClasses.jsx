import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getClasses, setClasses, getStudents, setStudents, getSubjects, getClassById, getStudentById } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Trash2, Edit, UserPlus, BookOpen, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";


const TeacherManageClasses = () => {
  const { toast } = useToast();
  const [classes, setLocalClasses] = useState(getClasses());
  const [students, setLocalStudentsState] = useState(getStudents()); // Renamed to avoid conflict
  const [subjects, setLocalSubjects] = useState(getSubjects());

  const [newClassName, setNewClassName] = useState('');
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);

  const [editingClass, setEditingClass] = useState(null); 
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [editedClassName, setEditedClassName] = useState('');

  const [managingClassStudents, setManagingClassStudents] = useState(null);
  const [isManageStudentsDialogOpen, setIsManageStudentsDialogOpen] = useState(false);
  const [selectedStudentsForClass, setSelectedStudentsForClass] = useState([]);

  const [managingClassSubjects, setManagingClassSubjects] = useState(null);
  const [isManageSubjectsDialogOpen, setIsManageSubjectsDialogOpen] = useState(false);
  const [selectedSubjectsForClass, setSelectedSubjectsForClass] = useState([]);

  useEffect(() => {
    setLocalClasses(getClasses());
    setLocalStudentsState(getStudents());
    setLocalSubjects(getSubjects());
  }, []);

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      toast({ title: "Erro", description: "O nome da turma não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (classes.some(c => c.name.toLowerCase() === newClassName.trim().toLowerCase())) {
      toast({ title: "Erro", description: "Essa turma já existe.", variant: "destructive" });
      return;
    }
    const newClass = {
      id: `class_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newClassName.trim(),
      studentIds: [],
      subjectIds: [],
    };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    setLocalClasses(updatedClasses);
    setNewClassName('');
    setIsAddClassDialogOpen(false);
    toast({ title: "Sucesso!", description: `Turma "${newClass.name}" criada.`, className: "bg-green-600 border-green-700 text-white" });
  };

  const openEditClassDialog = (classObj) => {
    setEditingClass(classObj);
    setEditedClassName(classObj.name);
    setIsEditClassDialogOpen(true);
  };

  const handleEditClass = (e) => {
    e.preventDefault();
    if (!editedClassName.trim()) {
      toast({ title: "Erro", description: "O nome da turma não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (classes.some(c => c.name.toLowerCase() === editedClassName.trim().toLowerCase() && c.id !== editingClass.id)) {
      toast({ title: "Erro", description: "Já existe outra turma com esse nome.", variant: "destructive" });
      return;
    }
    const updatedClasses = classes.map(c => c.id === editingClass.id ? { ...c, name: editedClassName.trim() } : c);
    setClasses(updatedClasses);
    setLocalClasses(updatedClasses);
    setEditingClass(null);
    setIsEditClassDialogOpen(false);
    toast({ title: "Sucesso!", description: "Nome da turma atualizado.", className: "bg-green-600 border-green-700 text-white" });
  };
  
  const handleDeleteClass = (classId) => {
    const targetClass = classes.find(c => c.id === classId);
    if (targetClass && targetClass.studentIds && targetClass.studentIds.length > 0) {
      toast({ title: "Atenção", description: "Não é possível excluir turmas com alunos. Remova os alunos primeiro.", variant: "destructive" });
      return;
    }
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    setLocalClasses(updatedClasses);
    toast({ title: "Turma Removida", description: "A turma foi removida com sucesso.", variant: "default" });
  };

  const openManageStudentsDialog = (classObj) => {
    setManagingClassStudents(classObj);
    setSelectedStudentsForClass([...classObj.studentIds]);
    setIsManageStudentsDialogOpen(true);
  };

  const handleStudentSelectionChange = (studentId) => {
    setSelectedStudentsForClass(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveClassStudents = () => {
    if (!managingClassStudents) return;

    let currentStudents = getStudents();
    
    currentStudents.forEach(student => {
      const wasInThisClass = student.classIds?.includes(managingClassStudents.id);
      const isInSelection = selectedStudentsForClass.includes(student.id);

      if (wasInThisClass && !isInSelection) { 
        student.classIds = student.classIds.filter(cid => cid !== managingClassStudents.id);
      } else if (!wasInThisClass && isInSelection) {
        student.classIds = [...(student.classIds || []), managingClassStudents.id];
      }
    });
    setStudents(currentStudents); 
    setLocalStudentsState(currentStudents);

    const updatedClasses = classes.map(c => {
      if (c.id === managingClassStudents.id) {
        return { ...c, studentIds: [...selectedStudentsForClass] };
      }
      return c;
    });
    setClasses(updatedClasses);
    setLocalClasses(updatedClasses);

    setIsManageStudentsDialogOpen(false);
    setManagingClassStudents(null);
    toast({ title: "Sucesso!", description: "Alunos da turma atualizados.", className: "bg-green-600 border-green-700 text-white" });
  };

  const openManageSubjectsDialog = (classObj) => {
    setManagingClassSubjects(classObj);
    setSelectedSubjectsForClass([...classObj.subjectIds]);
    setIsManageSubjectsDialogOpen(true);
  };

  const handleSubjectSelectionForClassChange = (subjectId) => {
    setSelectedSubjectsForClass(prev => 
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveClassSubjects = () => {
    if (!managingClassSubjects) return;
    const updatedClasses = classes.map(c => 
      c.id === managingClassSubjects.id ? { ...c, subjectIds: [...selectedSubjectsForClass] } : c
    );
    setClasses(updatedClasses);
    setLocalClasses(updatedClasses);
    setIsManageSubjectsDialogOpen(false);
    setManagingClassSubjects(null);
    toast({ title: "Sucesso!", description: "Matérias da turma atualizadas.", className: "bg-green-600 border-green-700 text-white" });
  };
  
  const studentsAvailableForClass = () => {
    return students; 
  };

  return (
    <Card className="glassmorphic">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-primary text-2xl">Gerenciar Turmas</CardTitle>
          <CardDescription className="text-muted-foreground">Crie, edite e gerencie alunos e matérias das turmas.</CardDescription>
        </div>
        <Button onClick={() => setIsAddClassDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-yellow-400">
          <PlusCircle className="mr-2 h-5 w-5" /> Criar Turma
        </Button>
      </CardHeader>
      <CardContent>
        {classes.length > 0 ? (
          <div className="space-y-4">
            {classes.map(classObj => (
              <Card key={classObj.id} className="bg-card/60 border-primary/20 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-yellow-400">{classObj.name}</CardTitle>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10" onClick={() => openEditClassDialog(classObj)}>
                      <Edit className="mr-1 h-4 w-4" /> Editar Nome
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                          <Trash2 className="mr-1 h-4 w-4" /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a turma "{classObj.name}"? {classObj.studentIds && classObj.studentIds.length > 0 ? "Esta turma possui alunos. A exclusão só é permitida para turmas vazias." : "Esta ação não pode ser desfeita."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteClass(classObj.id)} 
                            disabled={classObj.studentIds && classObj.studentIds.length > 0}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 px-0" onClick={() => openManageStudentsDialog(classObj)}>
                      <UserPlus className="mr-2 h-5 w-5" /> Gerenciar Alunos ({classObj.studentIds?.length || 0})
                    </Button>
                  </div>
                  <div>
                    <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 px-0" onClick={() => openManageSubjectsDialog(classObj)}>
                       <BookOpen className="mr-2 h-5 w-5" /> Gerenciar Matérias ({classObj.subjectIds?.length || 0})
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Alunos: {classObj.studentIds?.map(sid => getStudentById(sid)?.name).join(', ') || 'Nenhum aluno'}</p>
                    <p>Matérias: {classObj.subjectIds?.map(subId => getSubjects().find(s=>s.id === subId)?.name).join(', ') || 'Nenhuma matéria'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma turma cadastrada ainda.</p>
        )}
      </CardContent>

      {/* Add Class Dialog */}
      <AlertDialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
        <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Criar Nova Turma</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={handleAddClass} className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-class-name" className="text-foreground">Nome da Turma</Label>
              <Input id="new-class-name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Ex: Turma C" className="bg-input border-input-border focus:border-primary" required />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsAddClassDialogOpen(false)} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
              <Button type="submit" className="bg-primary hover:bg-yellow-400 text-primary-foreground">Criar Turma</Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Class Name Dialog */}
      {editingClass && (
        <AlertDialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
          <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Nome da Turma</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={handleEditClass} className="space-y-4 py-2">
              <div>
                <Label htmlFor="edit-class-name" className="text-foreground">Nome da Turma</Label>
                <Input id="edit-class-name" value={editedClassName} onChange={(e) => setEditedClassName(e.target.value)} className="bg-input border-input-border focus:border-primary" required />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsEditClassDialogOpen(false)} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
                <Button type="submit" className="bg-primary hover:bg-yellow-400 text-primary-foreground">Salvar</Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Manage Students Dialog */}
      {managingClassStudents && (
        <AlertDialog open={isManageStudentsDialogOpen} onOpenChange={setIsManageStudentsDialogOpen}>
          <AlertDialogContent className="bg-card border-primary/50 text-card-foreground max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Gerenciar Alunos da Turma: {managingClassStudents.name}</AlertDialogTitle>
              <AlertDialogDescription>Selecione os alunos para adicionar ou remover desta turma.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-80 overflow-y-auto py-4 space-y-2 pr-2">
              {studentsAvailableForClass().length > 0 ? studentsAvailableForClass().map(student => (
                <div key={student.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudentsForClass.includes(student.id)}
                    onCheckedChange={() => handleStudentSelectionChange(student.id)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor={`student-${student.id}`} className="text-foreground cursor-pointer">
                    {student.name}
                    {student.classIds && student.classIds.length > 0 && student.classIds.includes(managingClassStudents.id) ? '' : 
                     student.classIds && student.classIds.length > 0 ? 
                     ` (Turmas: ${student.classIds.map(cid => getClassById(cid)?.name || 'Outra').join(', ')})` 
                     : ' (Sem turma)'
                    }
                  </Label>
                </div>
              )) : <p className="text-muted-foreground text-center">Nenhum aluno disponível.</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsManageStudentsDialogOpen(false)} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
              <Button onClick={handleSaveClassStudents} className="bg-primary hover:bg-yellow-400 text-primary-foreground">
                <Save className="mr-2 h-4 w-4"/> Salvar Alunos
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Manage Subjects Dialog */}
      {managingClassSubjects && (
         <AlertDialog open={isManageSubjectsDialogOpen} onOpenChange={setIsManageSubjectsDialogOpen}>
         <AlertDialogContent className="bg-card border-primary/50 text-card-foreground max-w-lg">
           <AlertDialogHeader>
             <AlertDialogTitle>Gerenciar Matérias da Turma: {managingClassSubjects.name}</AlertDialogTitle>
             <AlertDialogDescription>Selecione as matérias que serão lecionadas nesta turma.</AlertDialogDescription>
           </AlertDialogHeader>
           <div className="max-h-80 overflow-y-auto py-4 space-y-2 pr-2">
             {subjects.length > 0 ? subjects.map(subject => (
               <div key={subject.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30">
                 <Checkbox
                   id={`subject-class-${subject.id}`}
                   checked={selectedSubjectsForClass.includes(subject.id)}
                   onCheckedChange={() => handleSubjectSelectionForClassChange(subject.id)}
                   className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                 />
                 <Label htmlFor={`subject-class-${subject.id}`} className="text-foreground cursor-pointer">
                   {subject.name}
                 </Label>
               </div>
             )) : <p className="text-muted-foreground text-center">Nenhuma matéria cadastrada no sistema.</p>}
           </div>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setIsManageSubjectsDialogOpen(false)} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
             <Button onClick={handleSaveClassSubjects} className="bg-primary hover:bg-yellow-400 text-primary-foreground">
                <Save className="mr-2 h-4 w-4"/> Salvar Matérias
             </Button>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
      )}

    </Card>
  );
};

export default TeacherManageClasses;