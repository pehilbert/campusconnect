import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;