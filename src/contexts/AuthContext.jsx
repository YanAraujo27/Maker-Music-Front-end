
import React, { createContext, useState, useEffect } from 'react';
import { getUsers, getStudentById, getTeacherById, getGuardianById } from '@/lib/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entityData, setEntityData] = useState(null); // To store student/teacher/guardian specific data

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchEntityData(parsedUser);
    }
    setLoading(false);
  }, []);

  const fetchEntityData = (currentUser) => {
    if (!currentUser) {
      setEntityData(null);
      return;
    }
    switch (currentUser.role) {
      case 'student':
        setEntityData(getStudentById(currentUser.entityId));
        break;
      case 'teacher':
        setEntityData(getTeacherById(currentUser.entityId));
        break;
      case 'guardian':
        setEntityData(getGuardianById(currentUser.entityId));
        break;
      default:
        setEntityData(null);
    }
  };

  const login = (username, password) => {
    const users = getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      fetchEntityData(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setEntityData(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    entityData,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
  