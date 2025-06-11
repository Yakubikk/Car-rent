import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { Assignment } from '@/types';
import { getAllAssignments } from '@/api/assignments';
import { useAuth } from '@/context/AuthContext';
import { FiBook, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

// Assignment status based on submission and due date
type AssignmentStatus = 'completed' | 'pending' | 'late' | 'upcoming' | 'graded';

const AssignmentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AssignmentStatus | 'all'>('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await getAllAssignments();
        setAssignments(data);
      } catch {
        toast.error(t('assignments.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [t]);

  // Determine assignment status
  const getAssignmentStatus = (assignment: Assignment): AssignmentStatus => {
    if (!user) return 'upcoming';
    
    // For teachers/admins, just check if it's past due
    if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
        return 'late';
      }
      return 'upcoming';
    }
    
    // For students, check if they've submitted
    const userSubmission = assignment.submissions?.find(
      (submission) => submission.studentId === user.id
    );
    
    if (userSubmission) {
      if (userSubmission.grade !== null) {
        return 'graded';
      }
      return 'completed';
    }
    
    // No submission - check due date
    if (assignment.dueDate) {
      if (new Date(assignment.dueDate) < new Date()) {
        return 'late';
      }
    }
    
    return 'pending';
  };
  
  // Get status label and color
  const getStatusInfo = (status: AssignmentStatus) => {
    switch (status) {
      case 'completed':
        return { 
          label: t('assignments.statusCompleted'), 
          color: 'text-green-500',
          icon: <FiCheckCircle />
        };
      case 'pending':
        return { 
          label: t('assignments.statusPending'), 
          color: 'text-amber-500',
          icon: <FiClock />
        };
      case 'late':
        return { 
          label: t('assignments.statusLate'), 
          color: 'text-red-500',
          icon: <FiAlertCircle />
        };
      case 'upcoming':
        return { 
          label: t('assignments.statusUpcoming'), 
          color: 'text-blue-500',
          icon: <FiCalendar />
        };
      case 'graded':
        return { 
          label: t('assignments.statusGraded'), 
          color: 'text-purple-500',
          icon: <FiCheckCircle />
        };
      default:
        return { 
          label: '', 
          color: '',
          icon: null
        };
    }
  };

  // Filter assignments based on status
  const filteredAssignments = activeFilter === 'all'
    ? assignments
    : assignments.filter(assignment => getAssignmentStatus(assignment) === activeFilter);

  // Group assignments by class
  const groupedAssignments = filteredAssignments.reduce<Record<string, Assignment[]>>(
    (groups, assignment) => {
      const classId = assignment.classId;
      if (!groups[classId]) {
        groups[classId] = [];
      }
      groups[classId].push(assignment);
      return groups;
    },
    {}
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
      <h1 className="text-3xl font-bold mb-6">{t('assignments.allAssignments')}</h1>
      
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-md ${
            activeFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('assignments.filterAll')}
        </button>
        
        {user?.role === 'STUDENT' && (
          <>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiClock />
              {t('assignments.filterPending')}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeFilter === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiCheckCircle />
              {t('assignments.filterCompleted')}
            </button>
            <button
              onClick={() => setActiveFilter('graded')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeFilter === 'graded'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiCheckCircle />
              {t('assignments.filterGraded')}
            </button>
          </>
        )}
        
        <button
          onClick={() => setActiveFilter('late')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            activeFilter === 'late'
              ? 'bg-red-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <FiAlertCircle />
          {t('assignments.filterLate')}
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            activeFilter === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <FiCalendar />
          {t('assignments.filterUpcoming')}
        </button>
      </div>
      
      {/* Assignments List */}
      {Object.keys(groupedAssignments).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedAssignments).map(([classId, classAssignments]) => (
            <div key={classId} className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <Link 
                  to={`/classes/${classId}`}
                  className="text-lg font-semibold hover:text-primary"
                >
                  {classAssignments[0].class?.name || t('assignments.unknownClass')}
                </Link>
              </div>
              
              <div className="divide-y divide-border">
                {classAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const { label, color, icon } = getStatusInfo(status);
                  
                  const userSubmission = assignment.submissions?.find(
                    (submission) => submission.studentId === user?.id
                  );
                  
                  return (
                    <div 
                      key={assignment.id}
                      className="p-4 hover:bg-muted/50 transition cursor-pointer"
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <div className="flex items-center gap-1">
                          <span className={`flex items-center gap-1 ${color}`}>
                            {icon}
                            {label}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {assignment.description}
                      </p>
                      
                      <div className="flex justify-between text-sm">
                        <div className="text-muted-foreground">
                          {t('assignments.points')}: {assignment.totalPoints}
                        </div>
                        
                        {userSubmission && userSubmission.grade !== null && userSubmission.grade !== undefined && (
                          <div className={`font-medium ${
                            ((userSubmission.grade || 0) / assignment.totalPoints) >= 0.6
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}>
                            {t('assignments.grade')}: {userSubmission.grade} / {assignment.totalPoints}
                          </div>
                        )}
                        
                        {assignment.dueDate && (
                          <div className={`${
                            new Date(assignment.dueDate) < new Date() ? 'text-red-500' : ''
                          }`}>
                            {t('assignments.due')}: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <FiBook className="mx-auto text-5xl text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {activeFilter === 'all'
              ? t('assignments.noAssignmentsTitle')
              : t('assignments.noFilteredAssignmentsTitle')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {activeFilter === 'all'
              ? t('assignments.noAssignmentsDescription')
              : t('assignments.noFilteredAssignmentsDescription')}
          </p>
          
          <button
            onClick={() => setActiveFilter('all')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition mx-auto"
          >
            {t('assignments.viewAllAssignments')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
