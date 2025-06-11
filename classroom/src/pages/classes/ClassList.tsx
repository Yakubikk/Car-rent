import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { Class } from '@/types';
import { getAllClasses, enrollInClass } from '@/api/classes';
import { useAuth } from '@/context/AuthContext';
import { FiPlus, FiBook, FiUsers } from 'react-icons/fi';

const ClassList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await getAllClasses();
        setClasses(data);
      } catch {
        toast.error(t('classes.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [t]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentCode.trim()) {
      toast.error(t('classes.enrollmentCodeRequired'));
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      await enrollInClass(enrollmentCode);
      
      // Refetch classes to show the newly enrolled class
      const updatedClasses = await getAllClasses();
      setClasses(updatedClasses);
      
      setEnrollmentCode('');
      setShowEnrollModal(false);
      toast.success(t('classes.enrollSuccess'));
    } catch {
      toast.error(t('classes.enrollError'));
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('classes.title')}</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <FiUsers className="text-lg" />
            {t('classes.joinClass')}
          </button>
          
          {isTeacherOrAdmin && (
            <Link
              to="/classes/create"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            >
              <FiPlus className="text-lg" />
              {t('classes.createClass')}
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link 
              key={classItem.id} 
              to={`/classes/${classItem.id}`}
              className="block bg-card rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div 
                className="h-40 bg-cover bg-center"
                style={{ 
                  backgroundImage: classItem.coverImage 
                    ? `url(${classItem.coverImage})` 
                    : 'linear-gradient(to right, var(--primary), var(--primary-dark))'
                }}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{classItem.name}</h3>
                {classItem.subject && (
                  <p className="text-muted-foreground mb-4">{classItem.subject}</p>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {classItem._count?.enrollments || 0} {t('classes.students')}
                    </span>
                  </div>
                  {classItem.ownerId === user?.id && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {t('classes.owner')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <FiBook className="mx-auto text-5xl text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('classes.noClassesTitle')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('classes.noClassesDescription')}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <FiUsers className="text-lg" />
              {t('classes.joinClass')}
            </button>
            
            {isTeacherOrAdmin && (
              <Link
                to="/classes/create"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                <FiPlus className="text-lg" />
                {t('classes.createClass')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('classes.joinClass')}</h2>
            <form onSubmit={handleEnroll}>
              <div className="mb-4">
                <label htmlFor="enrollmentCode" className="block text-sm font-medium mb-1">
                  {t('classes.enrollmentCode')}
                </label>
                <input
                  type="text"
                  id="enrollmentCode"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('classes.enterEnrollmentCode')}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollModal(false);
                    setEnrollmentCode('');
                  }}
                  className="px-4 py-2 border border-border rounded-md"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                  disabled={enrollmentLoading}
                >
                  {enrollmentLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      {t('common.loading')}
                    </span>
                  ) : (
                    t('classes.join')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
