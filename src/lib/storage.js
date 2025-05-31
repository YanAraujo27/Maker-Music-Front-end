const USERS_KEY = 'portal_users';
const STUDENTS_KEY = 'portal_students';
const GUARDIANS_KEY = 'portal_guardians';
const TEACHERS_KEY = 'portal_teachers';
const GRADES_KEY = 'portal_grades';
const COMMENTS_KEY = 'portal_comments';
const LESSONS_KEY = 'portal_lessons';
const SUBJECTS_KEY = 'portal_subjects';
const CLASSES_KEY = 'portal_classes';

const getInitialData = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

// Initial sample data
const initialUsers = [
  { id: 'user1', username: 'aluno1', password: 'password', role: 'student', entityId: 'student1', mustChangePassword: false },
  { id: 'user2', username: 'professor1', password: 'password', role: 'teacher', entityId: 'teacher1', mustChangePassword: false },
  { id: 'user3', username: 'responsavel1', password: 'password', role: 'guardian', entityId: 'guardian1', mustChangePassword: false },
  { id: 'user4', username: 'aluno2', password: 'password', role: 'student', entityId: 'student2', mustChangePassword: false },
];

const initialClasses = [
    { id: 'classA', name: 'Turma A', studentIds: ['student1', 'student2'], subjectIds: ['subject1', 'subject2', 'subject4'] },
    { id: 'classB', name: 'Turma B', studentIds: [], subjectIds: ['subject1', 'subject3'] },
];

const initialStudents = [
  { id: 'student1', name: 'João Silva', functional: 'S001', email: 'joao.silva@escola.com', startDate: '2023-02-01', guardianId: 'guardian1', classIds: ['classA'] },
  { id: 'student2', name: 'Maria Oliveira', functional: 'S002', email: 'maria.oliveira@escola.com', startDate: '2023-02-01', guardianId: 'guardian1', classIds: ['classA'] },
];

const initialSubjects = [
  { id: 'subject1', name: 'Matemática', teacherId: 'teacher1' },
  { id: 'subject2', name: 'Ciências', teacherId: 'teacher1' },
  { id: 'subject3', name: 'História', teacherId: null },
  { id: 'subject4', name: 'Português', teacherId: null },
];

const initialTeachers = [
  { id: 'teacher1', name: 'Prof. Carlos Andrade', functional: 'T001', email: 'carlos.andrade@escola.com', phone: '11987654321', subjectIds: ['subject1', 'subject2'] },
];

const initialGuardians = [
  { id: 'guardian1', name: 'Ana Silva (Mãe)', email: 'ana.silva@email.com', address: 'Rua das Flores, 123', phone: '11912345678', studentIds: ['student1', 'student2'] },
];

const initialGrades = [
    { id: 'grade1', studentId: 'student1', subjectId: 'subject1', grade: '8.5', date: '2025-03-15', teacherId: 'teacher1' },
    { id: 'grade2', studentId: 'student1', subjectId: 'subject2', grade: '9.0', date: '2025-03-20', teacherId: 'teacher1' },
    { id: 'grade3', studentId: 'student2', subjectId: 'subject1', grade: '7.0', date: '2025-03-15', teacherId: 'teacher1' },
];

const initialComments = [
    { id: 'comment1', studentId: 'student1', comment: 'Excelente participação na aula de Matemática.', date: '2025-03-16', teacherId: 'teacher1', type: 'feedback' },
];

const initialLessons = [
    { id: 'lesson1', title: 'Introdução às Frações', content: 'Material sobre frações, exercícios propostos...', date: '2025-03-10', teacherId: 'teacher1', subjectId: 'subject1', classId: 'classA'},
];

// Initialize localStorage if empty
if (!localStorage.getItem(USERS_KEY)) {
  setData(USERS_KEY, initialUsers);
}
if (!localStorage.getItem(STUDENTS_KEY)) {
  setData(STUDENTS_KEY, initialStudents);
}
if (!localStorage.getItem(TEACHERS_KEY)) {
  setData(TEACHERS_KEY, initialTeachers);
}
if (!localStorage.getItem(GUARDIANS_KEY)) {
  setData(GUARDIANS_KEY, initialGuardians);
}
if (!localStorage.getItem(GRADES_KEY)) {
  setData(GRADES_KEY, initialGrades);
}
if (!localStorage.getItem(COMMENTS_KEY)) {
  setData(COMMENTS_KEY, initialComments);
}
if (!localStorage.getItem(LESSONS_KEY)) {
  setData(LESSONS_KEY, initialLessons);
}
if (!localStorage.getItem(SUBJECTS_KEY)) {
  setData(SUBJECTS_KEY, initialSubjects);
}
if (!localStorage.getItem(CLASSES_KEY)) {
  setData(CLASSES_KEY, initialClasses);
}


export const getUsers = () => getInitialData(USERS_KEY, initialUsers);
export const setUsers = (users) => setData(USERS_KEY, users);

export const getStudents = () => getInitialData(STUDENTS_KEY, initialStudents);
export const setStudents = (students) => setData(STUDENTS_KEY, students);

export const getTeachers = () => getInitialData(TEACHERS_KEY, initialTeachers);
export const setTeachers = (teachers) => setData(TEACHERS_KEY, teachers);

export const getGuardians = () => getInitialData(GUARDIANS_KEY, initialGuardians);
export const setGuardians = (guardians) => setData(GUARDIANS_KEY, guardians);

export const getGrades = () => getInitialData(GRADES_KEY, initialGrades);
export const setGrades = (grades) => setData(GRADES_KEY, grades);

export const getComments = () => getInitialData(COMMENTS_KEY, initialComments);
export const setComments = (comments) => setData(COMMENTS_KEY, comments);

export const getLessons = () => getInitialData(LESSONS_KEY, initialLessons);
export const setLessons = (lessons) => setData(LESSONS_KEY, lessons);

export const getSubjects = () => getInitialData(SUBJECTS_KEY, initialSubjects);
export const setSubjects = (subjects) => setData(SUBJECTS_KEY, subjects);

export const getClasses = () => getInitialData(CLASSES_KEY, initialClasses);
export const setClasses = (classes) => setData(CLASSES_KEY, classes);

export const getStudentById = (studentId) => {
  const students = getStudents();
  return students.find(s => s.id === studentId);
}

export const getTeacherById = (teacherId) => {
  const teachers = getTeachers();
  return teachers.find(t => t.id === teacherId);
}

export const getGuardianById = (guardianId) => {
  const guardians = getGuardians();
  return guardians.find(g => g.id === guardianId);
}

export const getSubjectById = (subjectId) => {
  const subjects = getSubjects();
  return subjects.find(s => s.id === subjectId);
}

export const getClassById = (classId) => {
  const classes = getClasses();
  return classes.find(c => c.id === classId);
}

export const updateUserPassword = (userId, newPassword) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    users[userIndex].mustChangePassword = false; 
    setUsers(users);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === userId) {
      currentUser.password = newPassword;
      currentUser.mustChangePassword = false;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    return true;
  }
  return false;
};