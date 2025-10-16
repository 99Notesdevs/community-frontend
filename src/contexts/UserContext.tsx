"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

type UserModalType = 'login' | 'register' | null;

type UserContextType = {
  isUserModalOpen: boolean;
  userModalType: UserModalType;
  openUserModal: (type: UserModalType) => void;
  closeUserModal: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalType, setUserModalType] = useState<UserModalType>(null);

  const openUserModal = (type: UserModalType) => {
    setUserModalType(type);
    setIsUserModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setUserModalType(null);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  };

  return (
    <UserContext.Provider value={{ isUserModalOpen, userModalType, openUserModal, closeUserModal }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an UserProvider');
  }
  return context;
}
