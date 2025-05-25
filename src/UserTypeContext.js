import React, { createContext, useContext, useState, useEffect } from 'react';

const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => {
    // Recupera o userType do localStorage ou define como null
    return JSON.parse(localStorage.getItem('userType')) || null;
  });

  useEffect(() => {
    // Atualiza o localStorage quando o userType mudar
    localStorage.setItem('userType', JSON.stringify(userType));
  }, [userType]);

  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);
