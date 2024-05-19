import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext({
    authToken : null,
    username : null,
    login : () => {},
    logout : () => {}
});

export const AuthProvider = ({children}) => {
    const [authToken, setAuthToken] = useState(null);
    const [username, setUser] = useState(null);

    const login = (token, username) => {
        setAuthToken(token);
        setUser(username);
    }

    const logout = () => {
        setAuthToken(null);
        setUser(null);
    }

    const value = {
        authToken,
        username,
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