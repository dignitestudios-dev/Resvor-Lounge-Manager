const AuthLayout = ({ children }) => {
  return (
    <div className="w-screen min-h-screen overflow-x-hidden flex justify-center items-center auth_bg p-3 md:py-8 backgroundImage">
      {children}
    </div>
  );
};

export default AuthLayout;
