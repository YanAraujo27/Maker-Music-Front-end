import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { getSubjects, setSubjects, getTeachers, setTeachers as saveTeachers } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";
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

const TeacherManageSubjects = () => {
  const { toast } = useToast();
  const [subjects, setLocalSubjects] = useState(getSubjects());
  const [teachers, setLocalTeachers] = useState(getTeachers());
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedTeacherIdForNew, setSelectedTeacherIdForNew] = useState('');

  const [editingSubject, setEditingSubject] = useState(null); 
  const [editedSubjectName, setEditedSubjectName] = useState('');
  const [selectedTeacherIdForEdit, setSelectedTeacherIdForEdit] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setLocalSubjects(getSubjects());
    setLocalTeachers(getTeachers());
  }, []);

  const updateTeacherSubjectIds = (teacherId, subjectId, operation = 'add') => {
    const currentTeachers = getTeachers();
    const updatedTeachers = currentTeachers.map(t => {
      if (t.id === teacherId) {
        let newSubjectIds = t.subjectIds ? [...t.subjectIds] : [];
        if (operation === 'add' && !newSubjectIds.includes(subjectId)) {
          newSubjectIds.push(subjectId);
        } else if (operation === 'remove') {
          newSubjectIds = newSubjectIds.filter(id => id !== subjectId);
        }
        return { ...t, subjectIds: newSubjectIds };
      }
      return t;
    });
    saveTeachers(updatedTeachers);
    setLocalTeachers(updatedTeachers);
  };


  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      toast({ title: "Erro", description: "O nome da matéria não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (!selectedTeacherIdForNew || selectedTeacherIdForNew === "NO_TEACHER_SELECTED") {
      toast({ title: "Erro", description: "Um professor deve ser selecionado para a matéria.", variant: "destructive" });
      return;
    }
    if (subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast({ title: "Erro", description: "Essa matéria já existe.", variant: "destructive" });
      return;
    }

    const newSubject = {
      id: `subject_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newSubjectName.trim(),
      teacherId: selectedTeacherIdForNew,
    };
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    setLocalSubjects(updatedSubjects);
    
    updateTeacherSubjectIds(selectedTeacherIdForNew, newSubject.id, 'add');

    setNewSubjectName('');
    setSelectedTeacherIdForNew('');
    setIsAddDialogOpen(false);
    toast({ title: "Sucesso!", description: `Matéria "${newSubject.name}" adicionada.`, className: "bg-green-600 border-green-700 text-white" });
  };

  const handleDeleteSubject = (subjectId) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    if (subjectToDelete && subjectToDelete.teacherId) {
      updateTeacherSubjectIds(subjectToDelete.teacherId, subjectId, 'remove');
    }

    const updatedSubjects = subjects.filter(s => s.id !== subjectId);
    setSubjects(updatedSubjects);
    setLocalSubjects(updatedSubjects);
    toast({ title: "Matéria Removida", description: "A matéria foi removida com sucesso.", variant: "default" });
  };

  const handleEditSubject = (e) => {
    e.preventDefault();
    if (!editingSubject || !editedSubjectName.trim()) {
      toast({ title: "Erro", description: "O nome da matéria não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (!selectedTeacherIdForEdit || selectedTeacherIdForEdit === "NO_TEACHER_SELECTED") {
        toast({ title: "Erro", description: "Um professor deve ser selecionado para a matéria.", variant: "destructive" });
        return;
    }
    if (subjects.some(s => s.name.toLowerCase() === editedSubjectName.trim().toLowerCase() && s.id !== editingSubject.id)) {
      toast({ title: "Erro", description: "Já existe outra matéria com esse nome.", variant: "destructive" });
      return;
    }

    const oldTeacherId = editingSubject.teacherId;
    const newTeacherId = selectedTeacherIdForEdit;

    const updatedSubjects = subjects.map(s => 
      s.id === editingSubject.id ? { 
        ...s, 
        name: editedSubjectName.trim(),
        teacherId: newTeacherId
      } : s
    );
    setSubjects(updatedSubjects);
    setLocalSubjects(updatedSubjects);

    if (oldTeacherId && oldTeacherId !== newTeacherId) {
      updateTeacherSubjectIds(oldTeacherId, editingSubject.id, 'remove');
    }
    if (newTeacherId && oldTeacherId !== newTeacherId) {
      updateTeacherSubjectIds(newTeacherId, editingSubject.id, 'add');
    }
    

    setEditingSubject(null);
    setEditedSubjectName('');
    setSelectedTeacherIdForEdit('');
    setIsEditDialogOpen(false);
    toast({ title: "Sucesso!", description: "Matéria atualizada.", className: "bg-green-600 border-green-700 text-white" });
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setEditedSubjectName(subject.name);
    setSelectedTeacherIdForEdit(subject.teacherId || "");
    setIsEditDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setNewSubjectName('');
    setSelectedTeacherIdForNew(teachers.length > 0 ? '' : 'NO_TEACHERS_AVAILABLE');
    setIsAddDialogOpen(true);
  }


  return (
    <Card className="glassmorphic">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-primary text-2xl">Gerenciar Matérias</CardTitle>
          <CardDescription className="text-muted-foreground">Adicione, edite ou remova matérias e associe-as a professores.</CardDescription>
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-yellow-400" disabled={teachers.length === 0}>
          <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Matéria
        </Button>
      </CardHeader>
      <CardContent>
        {teachers.length === 0 && (
            <div className="p-3 mb-4 bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p className="text-sm">Nenhum professor cadastrado. Cadastre professores antes de adicionar matérias.</p>
            </div>
        )}
        {subjects.length > 0 ? (
          <ul className="space-y-3">
            {subjects.map(subject => {
              const teacher = subject.teacherId ? teachers.find(t => t.id === subject.teacherId) : null;
              return (
                <li key={subject.id} className="flex items-center justify-between p-4 bg-card/60 rounded-lg border border-primary/20 shadow-sm">
                  <div>
                    <span className="text-lg font-medium text-foreground">{subject.name}</span>
                    <p className="text-sm text-muted-foreground">
                      Professor: {teacher ? teacher.name : <span className="italic text-destructive">Não associado</span>}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="icon" className="text-primary border-primary hover:bg-primary/10" onClick={() => openEditDialog(subject)} disabled={teachers.length === 0}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive border-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a matéria "{subject.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma matéria cadastrada ainda.</p>
        )}
      </CardContent>

      {/* Add Subject Dialog */}
      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Nova Matéria</AlertDialogTitle>
            <AlertDialogDescription>
              Digite o nome da nova matéria e selecione um professor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleAddSubject} className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-subject-name" className="text-foreground">Nome da Matéria</Label>
              <Input 
                id="new-subject-name" 
                value={newSubjectName} 
                onChange={(e) => setNewSubjectName(e.target.value)} 
                placeholder="Ex: Programação Web" 
                className="bg-input border-input-border focus:border-primary"
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-subject-teacher" className="text-foreground">Professor</Label>
              <Select onValueChange={setSelectedTeacherIdForNew} value={selectedTeacherIdForNew} required>
                <SelectTrigger id="new-subject-teacher" className="bg-input border-input-border focus:border-primary text-foreground">
                  <SelectValue placeholder="Selecione um Professor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/50 text-card-foreground">
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {teachers.length === 0 && <p className="text-xs text-destructive-foreground mt-1">Nenhum professor cadastrado. Cadastre um professor primeiro.</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsAddDialogOpen(false)} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
              <Button type="submit" className="bg-primary hover:bg-yellow-400 text-primary-foreground" disabled={teachers.length === 0}>Adicionar</Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Subject Dialog */}
      {editingSubject && (
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="bg-card border-primary/50 text-card-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Matéria</AlertDialogTitle>
              <AlertDialogDescription>
                Altere o nome da matéria e/ou o professor associado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleEditSubject} className="space-y-4 py-2">
              <div>
                <Label htmlFor="edit-subject-name" className="text-foreground">Nome da Matéria</Label>
                <Input 
                  id="edit-subject-name" 
                  value={editedSubjectName} 
                  onChange={(e) => setEditedSubjectName(e.target.value)} 
                  className="bg-input border-input-border focus:border-primary"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-subject-teacher" className="text-foreground">Professor</Label>
                <Select onValueChange={setSelectedTeacherIdForEdit} value={selectedTeacherIdForEdit} required>
                  <SelectTrigger id="edit-subject-teacher" className="bg-input border-input-border focus:border-primary text-foreground">
                    <SelectValue placeholder="Selecione um Professor" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/50 text-card-foreground">
                     {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {teachers.length === 0 && <p className="text-xs text-destructive-foreground mt-1">Nenhum professor cadastrado. Cadastre um professor primeiro.</p>}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setEditingSubject(null); setIsEditDialogOpen(false); }} className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
                <Button type="submit" className="bg-primary hover:bg-yellow-400 text-primary-foreground" disabled={teachers.length === 0}>Salvar Alterações</Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </Card>
  );
};

export default TeacherManageSubjects;