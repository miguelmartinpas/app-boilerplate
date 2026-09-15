export type AuthUser = {
  name: string;
  email: string;
  avatarInitials: string;
};

export function useAuth(): { user: AuthUser; isAuthenticated: boolean } {
  return {
    user: { name: 'Jordan Rivera', email: 'jordan.rivera@example.com', avatarInitials: 'JR' },
    isAuthenticated: true,
  };
}
