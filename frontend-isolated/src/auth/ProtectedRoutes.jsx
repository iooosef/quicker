import { Outlet, Navigate } from "react-router-dom";
import { useUser } from '../auth/UserContext';

const ProtectedRoutes = ({ allowedRoles }) => {
    const { user, loading  } = useUser();

    if (loading) return <p>Loading... PR</p>;

    if (!user) {
        return <Navigate to="/" />;
    }

    const hasRole = allowedRoles ? allowedRoles.includes(user?.role) : true;
    console.log(hasRole)
    if (!hasRole) {
        return (
            <div className="w-screen h-screen flex flex-col justify-center items-center">                
                <h1 className="bg-gradient-to-r from-primary to-error bg-clip-text text-transparent font-black text-6xl w-fit text-center">Error 403 - Forbidden</h1>
                <div className="text-2xl text-center">You do not have permission to access this page.</div>
            </div>
        )
    }    
    
    return <Outlet />;
}

export default ProtectedRoutes