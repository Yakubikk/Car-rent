import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  FiMessageSquare, 
  FiBook, 
  FiCheckCircle, 
  FiUserPlus, 
  FiBell 
} from 'react-icons/fi';

const NotificationListener = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!socket || !user || isListening) return;

    // Global notifications for the current user
    const handleNewPost = (data: { classId: string; className: string; authorName: string }) => {
      toast.custom((ts) => (
        <div className={`bg-card border-l-4 border-blue-500 p-3 shadow-md rounded-r-md flex items-start gap-3 max-w-md ${
          ts.visible ? 'animate-enter' : 'animate-leave'
        }`}>
          <FiMessageSquare className="text-blue-500 text-lg mt-0.5" />
          <div>
            <div className="font-medium">{data.authorName} {t('notifications.postedInClass')}</div>
            <div className="text-sm text-muted-foreground">{data.className}</div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    const handleNewAssignment = (data: { classId: string; className: string; assignmentTitle: string }) => {
      toast.custom((ts) => (
        <div className={`bg-card border-l-4 border-green-500 p-3 shadow-md rounded-r-md flex items-start gap-3 max-w-md ${
          ts.visible ? 'animate-enter' : 'animate-leave'
        }`}>
          <FiBook className="text-green-500 text-lg mt-0.5" />
          <div>
            <div className="font-medium">{t('notifications.newAssignment')}</div>
            <div className="text-sm">{data.assignmentTitle}</div>
            <div className="text-sm text-muted-foreground">{data.className}</div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    const handleGradedSubmission = (data: { assignmentTitle: string; grade: number; totalPoints: number }) => {
      toast.custom((ts) => (
        <div className={`bg-card border-l-4 border-purple-500 p-3 shadow-md rounded-r-md flex items-start gap-3 max-w-md ${
          ts.visible ? 'animate-enter' : 'animate-leave'
        }`}>
          <FiCheckCircle className="text-purple-500 text-lg mt-0.5" />
          <div>
            <div className="font-medium">{t('notifications.submissionGraded')}</div>
            <div className="text-sm">{data.assignmentTitle}</div>
            <div className="text-sm text-muted-foreground">
              {t('notifications.grade')}: {data.grade}/{data.totalPoints}
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    const handleClassEnrollment = (data: { className: string; enrollmentCode: string }) => {
      toast.custom((ts) => (
        <div className={`bg-card border-l-4 border-yellow-500 p-3 shadow-md rounded-r-md flex items-start gap-3 max-w-md ${
          ts.visible ? 'animate-enter' : 'animate-leave'
        }`}>
          <FiUserPlus className="text-yellow-500 text-lg mt-0.5" />
          <div>
            <div className="font-medium">{t('notifications.enrolledInClass')}</div>
            <div className="text-sm">{data.className}</div>
            <div className="text-sm text-muted-foreground">
              {t('notifications.code')}: {data.enrollmentCode}
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    };
    
    const handleGenericNotification = (data: { title: string; message: string; type?: string }) => {
      const notificationType = data.type || 'info';
      let color = 'blue-500';
      let icon = <FiBell className="text-blue-500 text-lg mt-0.5" />;
      
      switch (notificationType) {
        case 'success':
          color = 'green-500';
          icon = <FiCheckCircle className="text-green-500 text-lg mt-0.5" />;
          break;
        case 'warning':
          color = 'yellow-500';
          icon = <FiBell className="text-yellow-500 text-lg mt-0.5" />;
          break;
        case 'error':
          color = 'red-500';
          icon = <FiBell className="text-red-500 text-lg mt-0.5" />;
          break;
      }
      
      toast.custom((t) => (
        <div className={`bg-card border-l-4 border-${color} p-3 shadow-md rounded-r-md flex items-start gap-3 max-w-md ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}>
          {icon}
          <div>
            <div className="font-medium">{data.title}</div>
            <div className="text-sm text-muted-foreground">{data.message}</div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    // Register event listeners
    socket.on('notification:post', handleNewPost);
    socket.on('notification:assignment', handleNewAssignment);
    socket.on('notification:grade', handleGradedSubmission);
    socket.on('notification:enrollment', handleClassEnrollment);
    socket.on('notification:generic', handleGenericNotification);

    setIsListening(true);

    // Cleanup on unmount
    return () => {
      socket.off('notification:post', handleNewPost);
      socket.off('notification:assignment', handleNewAssignment);
      socket.off('notification:grade', handleGradedSubmission);
      socket.off('notification:enrollment', handleClassEnrollment);
      socket.off('notification:generic', handleGenericNotification);
    };
  }, [socket, user, t, isListening]);

  // This is a "hidden" component that just listens for notifications
  return null;
};

export default NotificationListener;
