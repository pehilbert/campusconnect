import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout.js";
import Test from "./test/Test.js";
import Users from "./users/Users.js";
import SignUp from "./signup/SignUp.js";

import "./App.css";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Test />}/>
                        <Route path="users" element={<Users />}/>
                        <Route path="signup" element={<SignUp />}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;