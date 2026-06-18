"use client";

import { createContext, useContext } from "react";
import { useAuthMe } from "@/lib/hooks/queries/useQueries";

const AuthContext = createContext(null);

export const useAuthContext = () => useContext(AuthContext);

const AuthLayout = ({ children }) => {
  const { data: authData, isLoading, isFetching } = useAuthMe();

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-screen w-screen text-white backgroundImage">
        Loading...
      </div>
    );
  }

  const contextValue = useMemo(() => {
    return {
      authData: authData || null,
    };
  }, [authData]);

  return (
    <AuthContext.Provider value={{ contextValue }}>
      <div className="w-screen min-h-screen overflow-x-hidden flex justify-center items-center p-3 md:py-8 backgroundImage">
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export default AuthLayout;
