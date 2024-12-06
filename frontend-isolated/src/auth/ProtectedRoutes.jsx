import { Outlet, Navigate } from "react-router-dom";
import { useUser } from '../auth/UserContext';

const ProtectedRoutes = () => {
    const { user, loading  } = useUser();
    if (loading) return <p>Loading... PR</p>;
    
    return user ? <Outlet/> : <Navigate to="/" />
}

export default ProtectedRoutes