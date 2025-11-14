import { User } from "@prisma/client";
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: any;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  
    const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
        const response = await fetch('/api/user');
       // console.log(response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json() as Promise<{
          user: User;
        }>;
      }
  });

  return (
    <UserContext.Provider value={{ user: user?.user ?? null, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };