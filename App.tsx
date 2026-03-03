// src/App.tsx
import { useState, useEffect } from 'react';
import type { User, UserWithoutId } from './types/User';
import UserTable from './component/UserTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import { userService } from './services/UserService';
import UserForm from './component/userForm';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage('error', 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = async (userData: UserWithoutId) => {
    setLoading(true);
    try {
      const newUser = await userService.create(userData);
      setUsers(prev => [...prev, newUser]);
      showMessage('success', 'Usuario creado exitosamente');
      handleCancel();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage('error', 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userData: UserWithoutId) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const updatedUser = await userService.update(selectedUser.id, userData);
      if (updatedUser) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ));
        showMessage('success', 'Usuario actualizado exitosamente');
        handleCancel();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage('error', 'Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const deleted = await userService.delete(id);
      if (deleted) {
        setUsers(prev => prev.filter(user => user.id !== id));
        showMessage('success', 'Usuario eliminado exitosamente');
        if (selectedUser?.id === id) {
          handleCancel();
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage('error', 'Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleCancel = () => {
    setSelectedUser(null);
  };

  const handleSubmit = (userData: UserWithoutId) => {
    if (selectedUser) {
      handleUpdate(userData);
    } else {
      handleCreate(userData);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">CRUD de Usuarios</h1>
      
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      <UserForm
        user={selectedUser}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
/>
    </div>
  );
}

export default App;