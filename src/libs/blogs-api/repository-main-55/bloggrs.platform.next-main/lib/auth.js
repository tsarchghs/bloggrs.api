import React, { useState, useEffect, useContext, createContext } from "react";
import useBloggrs from "../hooks/useBloggrs";

const authContext = createContext();

export function AuthProvider({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export const useAuth = () => {
    return useContext(authContext);
}

function useProvideAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const bloggrs = useBloggrs()

    const handleUser = (rawUser) => {
        if (rawUser) {
            const user = formatUser(rawUser);
            
            setLoading(false);
            setUser(user);
            return user;
        } else {
            setLoading(false);
            setUser(false);
            return false;
        }
    }

    const signin = () => {
        setLoading(true);
        return bloggrs.auth
            .getAuth()
            .then(({ user }) => handleUser(user))
    }
    const signout = () => {
        localStorage.removeItem("bloggrs::token");
        return handleUser(false);
    }

    return {
        user,
        loading,
        signin,
        signout,
    }
}

const formatUser = user => {
    return user;
}