import { useApi } from './useApi';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch and manage user authentication details
 */
export function useUserDetails() {
  const {
    data: user,
    error,
    isLoading,
    mutate
  } = useApi<UserDetails>('/user/checkAuth', {
    method: 'GET',
  });

  /**
   * Checks if the user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return !!user;
  };

  /**
   * Refreshes the user data by refetching from the API
   */
  const refreshUserData = async () => {
    return await mutate();
  };

  return {
    user,
    error,
    isLoading,
    isAuthenticated,
    refreshUserData
  };
}
