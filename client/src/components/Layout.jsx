import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider  from '../features/auth/AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import TaskForm from '../features/tasks/TaskForm';
import TaskList from '../features/tasks/TaskList';
import EditTaskPage  from '../features/tasks/EditTaskPage';
import Profile from '../features/users/Profile';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          {/* Main content area that grows to fill space */}
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/edit/:taskId" element={<EditTaskPage />} />
                <Route path="/users/:userId" element={<Profile />} />
                <Route path="/" element={<Navigate to="/tasks" />} />
              </Route>
              
              <Route path="*" element={
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-800">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                </div>
              } />
            </Routes>
          </main>
          
          <footer className="bg-white border-t py-4">
            <div className="container mx-auto px-4 text-center text-gray-500">
              © {new Date().getFullYear()} 💁 <b>Witty HandUp System.</b> All Rights Reserved!
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}