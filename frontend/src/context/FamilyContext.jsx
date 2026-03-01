import { createContext, useState, useContext, useEffect } from 'react';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [familyName, setFamilyName] = useState(() => localStorage.getItem('family_name') || '');

  const login = (name) => {
    setFamilyName(name);
    localStorage.setItem('family_name', name);
  };

  const logout = () => {
    setFamilyName('');
    localStorage.removeItem('family_name');
  };

  return (
    <FamilyContext.Provider value={{ familyName, login, logout }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => useContext(FamilyContext);
