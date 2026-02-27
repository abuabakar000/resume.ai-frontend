import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    },
    {
        path: '/builder',
        element: <ResumeBuilder />
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
