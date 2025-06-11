import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { User, Class } from '@/types';
import { getAllUsers, updateUser, deleteUser } from '@/api/users';
import { getAllClasses, deleteClass } from '@/api/classes';
import { FiTrash2, FiUserCheck, FiBookOpen, FiUsers, FiLock, FiSearch } from 'react-icons/fi';

type ActiveTab = 'users' | 'classes';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'user' | 'class' } | null>(null);
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, classesData] = await Promise.all([
          getAllUsers(),
          getAllClasses()
        ]);
        
        setUsers(usersData);
        setClasses(classesData);
      } catch (error) {
        toast.error(t('admin.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleDeleteItem = (id: string, type: 'user' | 'class') => {
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const handleUpdateRole = (user: User) => {
    setUserToUpdateRole(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'user') {
        await deleteUser(itemToDelete.id);
        setUsers(users.filter(user => user.id !== itemToDelete.id));
        toast.success(t('admin.userDeleted'));
      } else {
        await deleteClass(itemToDelete.id);
        setClasses(classes.filter(cls => cls.id !== itemToDelete.id));
        toast.success(t('admin.classDeleted'));
      }
    } catch (error) {
      toast.error(t('admin.deleteError'));
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const confirmRoleUpdate = async () => {
    if (!userToUpdateRole) return;
    
    try {
      await updateUser(userToUpdateRole.id, { role: newRole });
      
      // Update user in the list
      setUsers(users.map(user => 
        user.id === userToUpdateRole.id 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast.success(t('admin.roleUpdated'));
    } catch (error) {
      toast.error(t('admin.updateError'));
    } finally {
      setShowRoleModal(false);
      setUserToUpdateRole(null);
    }
  };

  // Filter items based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.subject && cls.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FiUsers className="text-lg" />
          {t('admin.users')}
        </button>
        <button
          onClick={() => handleTabChange('classes')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FiBookOpen className="text-lg" />
          {t('admin.classes')}
        </button>
      </div>
      
      {/* Search & Summary */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.search')}
              className="pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-muted-foreground">
          {activeTab === 'users' && (
            <>
              {t('admin.totalUsers')}: {users.length} | 
              {t('admin.students')}: {users.filter(u => u.role === 'STUDENT').length} | 
              {t('admin.teachers')}: {users.filter(u => u.role === 'TEACHER').length} | 
              {t('admin.admins')}: {users.filter(u => u.role === 'ADMIN').length}
            </>
          )}
          {activeTab === 'classes' && (
            <>
              {t('admin.totalClasses')}: {classes.length} | 
              {t('admin.activeClasses')}: {classes.filter(c => c.isActive).length}
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4">{t('admin.name')}</th>
                  <th className="text-left py-3 px-4">{t('admin.email')}</th>
                  <th className="text-left py-3 px-4">{t('admin.role')}</th>
                  <th className="text-left py-3 px-4">{t('admin.createdAt')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            {user.profile?.avatar ? (
                              <img 
                                src={user.profile.avatar} 
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : user.role === 'TEACHER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRole(user)}
                            className="text-blue-500 hover:text-blue-600"
                            title={t('admin.changeRole')}
                          >
                            <FiLock size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(user.id, 'user')}
                            className="text-red-500 hover:text-red-600"
                            title={t('admin.deleteUser')}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {searchTerm ? t('admin.noUsersFound') : t('admin.noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4">{t('admin.className')}</th>
                  <th className="text-left py-3 px-4">{t('admin.subject')}</th>
                  <th className="text-left py-3 px-4">{t('admin.owner')}</th>
                  <th className="text-left py-3 px-4">{t('admin.students')}</th>
                  <th className="text-left py-3 px-4">{t('admin.status')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <tr key={cls.id} className="border-t border-border">
                      <td className="py-4 px-4">
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('admin.code')}: {cls.enrollmentCode}
                        </div>
                      </td>
                      <td className="py-4 px-4">{cls.subject || '-'}</td>
                      <td className="py-4 px-4">{cls.owner?.name}</td>
                      <td className="py-4 px-4">{cls._count?.enrollments || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          cls.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {cls.isActive ? t('admin.active') : t('admin.inactive')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteItem(cls.id, 'class')}
                            className="text-red-500 hover:text-red-600"
                            title={t('admin.deleteClass')}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {searchTerm ? t('admin.noClassesFound') : t('admin.noClasses')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {itemToDelete?.type === 'user' 
                ? t('admin.confirmDeleteUser') 
                : t('admin.confirmDeleteClass')}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {itemToDelete?.type === 'user' 
                ? t('admin.deleteUserWarning') 
                : t('admin.deleteClassWarning')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-border rounded-md"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Role Update Modal */}
      {showRoleModal && userToUpdateRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {t('admin.updateRole', { user: userToUpdateRole.name })}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t('admin.selectRole')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newRole === 'STUDENT'}
                    onChange={() => setNewRole('STUDENT')}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <FiUserCheck className="text-green-500" />
                    <span>{t('admin.roleStudent')}</span>
                  </div>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newRole === 'TEACHER'}
                    onChange={() => setNewRole('TEACHER')}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <FiBookOpen className="text-blue-500" />
                    <span>{t('admin.roleTeacher')}</span>
                  </div>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newRole === 'ADMIN'}
                    onChange={() => setNewRole('ADMIN')}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <FiLock className="text-red-500" />
                    <span>{t('admin.roleAdmin')}</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setUserToUpdateRole(null);
                }}
                className="px-4 py-2 border border-border rounded-md"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmRoleUpdate}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
