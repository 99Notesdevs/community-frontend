import { useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export function useAuthModal() {
  const { openUserModal, closeUserModal } = useUser();

  const showLogin = useCallback(() => {
    console.log("Login clicked");
    openUserModal('login');
  }, [openUserModal]);

  const showRegister = useCallback(() => {
    console.log("Register clicked");
    openUserModal('register');
  }, [openUserModal]);

  return {
    showLogin,
    showRegister,
    closeUserModal,
  };
}
