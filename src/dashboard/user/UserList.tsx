import React, { useState, useEffect } from "react";
import UsuarioService from "../../services/UsuarioService";
import { Rol } from "../../entities/enums/Rol";
import Usuario from "../../entities/DTO/Usuario/Usuario";
import { useAuth0Extended } from "../../Auth/Auth0ProviderWithNavigate";
import Table from "react-bootstrap/esm/Table";
import { ManagementClient } from "auth0";


const UserList: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const { getAccessTokenSilently } = useAuth0Extended();

  const auth0ManagementClient = new ManagementClient({
    domain: "utntestrecursivos.us.auth0.com",
    clientId: "hA8Pui32zq3p7yXNlqr53gQ88LUuvZ7x",
    clientSecret: "PXml1O7iB3OCU4u4aER3rgYuzTil2yycIS_aWliQqgBoBX5TtDN3U1GrdatW1COi",
    audience: "https://utntestrecursivos.us.auth0.com/api/v2/",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const fetchedUsers = await UsuarioService.getAllUsuarios(token);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRoleChange = async (userId: number, newRole: Rol) => {
    try {
      const token = await getAccessTokenSilently();
      // Actualizar el rol en el servidor
      await UsuarioService.updateUsuarioRol(userId, newRole, token);
  
      // Actualizar el rol en el estado local para reflejar el cambio de inmediato
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, rol: newRole } : user
        )
      );
  
      // Actualizar el rol en Auth0
      await updateUserRoleInAuth0(userId.toString(), newRole);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };
  
  const updateUserRoleInAuth0 = async (userId: string, newRole: Rol) => {
    try {
      await auth0ManagementClient.users.update(
        { id: userId },
        { user_metadata: { role: newRole } }
      );
      console.log(`User ${userId} role updated to ${newRole} in Auth0`);
    } catch (error) {
      console.error("Error updating user role in Auth0:", error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <div className="col-md-10">
        <Table hover variant="dark">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.rol}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as Rol)
                    }
                  >
                    {Object.values(Rol).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserList;
