import { useState, useEffect } from "react";
import { Card, Title, Text, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from "@tremor/react";
import api from "../services/api";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  country: string;
  mensa_number: string;
  is_active: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "PARTICIPANT",
    country: "Spain",
    mensa_number: ""
  });
  const [editFormData, setEditFormData] = useState({
    id: 0,
    email: "",
    password: "",
    full_name: "",
    role: "PARTICIPANT",
    country: "",
    mensa_number: ""
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/");
      console.log("Users loaded:", response.data);
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      // If authentication error, show message
      if (err.response?.status === 401 || err.response?.status === 403) {
        setStatus({ type: "error", msg: "Authentication error. Please log in again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      await api.post("/users/", formData);
      setStatus({ type: "success", msg: "User created successfully" });
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "PARTICIPANT",
        country: "Spain",
        mensa_number: ""
      });
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error creating user";
      setStatus({ type: "error", msg: errorMsg });
    }
  };

  const handleEdit = (user: User) => {
    setShowForm(false);
    setShowEditForm(true);
    setEditFormData({
      id: user.id,
      email: user.email || "",
      password: "",
      full_name: user.full_name || "",
      role: user.role || "PARTICIPANT",
      country: user.country || "",
      mensa_number: user.mensa_number || ""
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const payload: any = {
        email: editFormData.email,
        full_name: editFormData.full_name,
        role: editFormData.role,
        country: editFormData.country,
        mensa_number: editFormData.mensa_number
      };

      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      await api.put(`/users/${editFormData.id}`, payload);
      setStatus({ type: "success", msg: "User updated successfully" });
      setShowEditForm(false);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error updating user";
      setStatus({ type: "error", msg: errorMsg });
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user ${userName}?`)) return;

    try {
      await api.delete(`/users/${userId}`);
      setStatus({ type: "success", msg: "User deleted successfully" });
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error deleting user";
      setStatus({ type: "error", msg: errorMsg });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "ADMIN": return "red";
      case "JUDGE": return "blue";
      case "PARTICIPANT": return "green";
      case "NATIONAL_COORDINATOR": return "orange";
      default: return "gray";
    }
  };

  if (loading) return <div className="p-20 text-center text-white">Loading users...</div>;

  return (
    <div className="p-8 pb-20 relative z-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="PhotoCup" className="h-14 w-auto object-contain" />
          <div>
            <Title className="text-white text-4xl font-black tracking-tighter uppercase">
              USER <span className="text-mensa-orange">MANAGEMENT</span>
            </Title>
            <Text className="text-gray-400 font-medium">Administration Panel • PhotoCup 2026</Text>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowEditForm(false);
            setShowForm(!showForm);
          }}
          className="bg-mensa-orange hover:bg-mensa-orange/90 border-none text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all text-sm uppercase tracking-widest"
        >
          {showForm ? "Cancel" : "+ New User"}
        </Button>
      </div>

      {status && (
        <div className={`mb-8 p-4 rounded-xl text-sm font-bold uppercase tracking-widest ${
          status.type === "success" 
            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {status.msg}
        </div>
      )}

      {showForm && (
        <Card className="glass border-white/5 rounded-3xl p-8 mb-10">
          <Title className="text-white text-lg font-bold uppercase tracking-tight mb-6">Create New User</Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Corporate Email</Text>
                <input
                  type="email"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="user@photocup.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Password</Text>
                <input
                  type="password"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Full Name</Text>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: John Smith"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Role</Text>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-mensa-orange outline-none transition-all appearance-none"
                >
                  <option value="PARTICIPANT" className="bg-[#0a0a0a] text-white">Participant</option>
                  <option value="JUDGE" className="bg-[#0a0a0a] text-white">Judge</option>
                  <option value="NATIONAL_COORDINATOR" className="bg-[#0a0a0a] text-white">National Coordinator</option>
                  <option value="ADMIN" className="bg-[#0a0a0a] text-white">Administrator</option>
                </select>
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Country</Text>
                <input
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: Spain"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Mensa Number (Optional)</Text>
                <input
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: ES-12345"
                  value={formData.mensa_number}
                  onChange={(e) => setFormData({...formData, mensa_number: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-mensa-orange hover:bg-mensa-orange/90 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
            >
              Create User
            </button>
          </form>
        </Card>
      )}

      {showEditForm && (
        <Card className="glass border-white/5 rounded-3xl p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Title className="text-white text-lg font-bold uppercase tracking-tight">Edit User</Title>
            <Button
              onClick={() => setShowEditForm(false)}
              className="bg-white/10 hover:bg-white/20 border-none text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest"
            >
              Cancel Edit
            </Button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Corporate Email</Text>
                <input
                  type="email"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="user@photocup.com"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">New Password (Optional)</Text>
                <input
                  type="password"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="Leave blank to keep unchanged"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Full Name</Text>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: John Smith"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Rol</Text>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-mensa-orange outline-none transition-all appearance-none"
                >
                  <option value="PARTICIPANT" className="bg-[#0a0a0a] text-white">Participant</option>
                  <option value="JUDGE" className="bg-[#0a0a0a] text-white">Judge</option>
                  <option value="NATIONAL_COORDINATOR" className="bg-[#0a0a0a] text-white">National Coordinator</option>
                  <option value="ADMIN" className="bg-[#0a0a0a] text-white">Administrator</option>
                </select>
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Country</Text>
                <input
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: Spain"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Mensa Number (Optional)</Text>
                <input
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: ES-12345"
                  value={editFormData.mensa_number}
                  onChange={(e) => setEditFormData({...editFormData, mensa_number: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-mensa-orange hover:bg-mensa-orange/90 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </form>
        </Card>
      )}

      <Card className="glass border-white/5 rounded-3xl p-8 overflow-hidden">
        <Title className="text-white text-lg font-bold uppercase tracking-tight mb-6">
          Usuarios Registrados ({users.length})
        </Title>
        <Table>
          <TableHead>
            <TableRow className="border-white/5">
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">ID</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">Email</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">Name</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">Role</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">Country</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest">Mensa #</TableHeaderCell>
              <TableHeaderCell className="text-gray-500 uppercase text-[10px] tracking-widest text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-white/[0.02] transition-colors border-white/5">
                <TableCell className="text-gray-400 font-bold">#{user.id}</TableCell>
                <TableCell className="text-white text-sm">{user.email}</TableCell>
                <TableCell className="text-gray-300 font-medium">{user.full_name}</TableCell>
                <TableCell>
                  <Badge color={getRoleBadgeColor(user.role)} className="text-xs font-black uppercase">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-400 text-xs">{user.country || "-"}</TableCell>
                <TableCell className="text-gray-500 text-xs font-mono">{user.mensa_number || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.full_name)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-600 italic">
                  No users registered.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
