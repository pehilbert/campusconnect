import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext({
    authToken : null,
    username : null,
    login : () => {},
    logout : () => {}
});

export const AuthProvider = ({children}) => {
    const [authToken, setAuthToken] = useState(null);
    const [id, setId] = useState(null);

    const login = (token, id) => {
        setAuthToken(token);
        setId(id);
    }

    const logout = () => {
        setAuthToken(null);
        setId(null);
    }

    const value = {
        authToken,
        id,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);