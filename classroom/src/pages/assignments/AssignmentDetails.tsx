import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { Assignment, Submission } from '@/types';
import { getAssignmentById, submitAssignment, gradeSubmission } from '@/api/assignments';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { FiFile, FiUpload, FiX, FiClock, FiCheckCircle, FiAlertCircle, FiEdit2 } from 'react-icons/fi';

const AssignmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, subscribeToAssignment, unsubscribeFromAssignment } = useSocket();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachments, setSubmissionAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        const data = await getAssignmentById(id);
        setAssignment(data);
        
        // Find the current user's submission if exists
        if (user && data.submissions) {
          const submission = data.submissions.find(s => s.studentId === user.id);
          if (submission) {
            setUserSubmission(submission);
            setGrade(submission.grade || null);
            setFeedback(submission.feedback || '');
          }
        }      } catch (err) {
        console.error('Error fetching assignment data:', err);
        toast.error(t('assignments.fetchError'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
    
    // Subscribe to assignment updates
    if (id) {
      subscribeToAssignment(id);
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (id) {
        unsubscribeFromAssignment(id);
      }
    };  }, [id, navigate, t, user, subscribeToAssignment, unsubscribeFromAssignment]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !id) return;

    // Handle new submission to the assignment
    const handleNewSubmission = (submission: Submission) => {
      if (submission.assignmentId === id) {
        // Update the assignment's submissions list
        setAssignment(prev => {
          if (!prev) return prev;
          
          const updatedSubmissions = prev.submissions 
            ? [...prev.submissions.filter(s => s.id !== submission.id), submission]
            : [submission];
            
          return {
            ...prev,
            submissions: updatedSubmissions
          };
        });
        
        // If this is the current user's submission, update it
        if (user && submission.studentId === user.id) {
          setUserSubmission(submission);
        }
        
        // Show notification
        toast.success(t('assignments.newSubmissionNotification', { 
          student: submission.student?.name || t('assignments.aStudent')
        }));
      }
    };
    
    // Handle graded submission
    const handleSubmissionGraded = (submission: Submission) => {
      if (submission.assignmentId === id) {
        // Update the assignment's submissions list
        setAssignment(prev => {
          if (!prev) return prev;
          
          const updatedSubmissions = prev.submissions 
            ? prev.submissions.map(s => s.id === submission.id ? submission : s)
            : [submission];
            
          return {
            ...prev,
            submissions: updatedSubmissions
          };
        });
        
        // If this is the current user's submission, update it and the form state
        if (user && submission.studentId === user.id) {
          setUserSubmission(submission);
          setGrade(submission.grade || null);
          setFeedback(submission.feedback || '');
          
          // Show notification to student
          toast.success(t('assignments.submissionGradedNotification'));
        }
        
        // If a teacher is viewing a submission that was just graded
        if (selectedSubmission && selectedSubmission.id === submission.id) {
          setSelectedSubmission(submission);
        }
      }
    };
    
    // Register event listeners
    socket.on('assignment:submission:new', handleNewSubmission);
    socket.on('assignment:submission:graded', handleSubmissionGraded);
    
    // Cleanup on unmount
    return () => {
      socket.off('assignment:submission:new', handleNewSubmission);
      socket.off('assignment:submission:graded', handleSubmissionGraded);
    };
  }, [socket, id, user, selectedSubmission, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (max 10MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error(t('assignments.fileSizeError'));
        return;
      }
      
      setSubmissionAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setSubmissionAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('content', submissionContent);
      
      submissionAttachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await submitAssignment(id, formData);
      
      setUserSubmission(response.submission);
      setSubmissionContent('');
      setSubmissionAttachments([]);
        toast.success(t('assignments.submitSuccess'));
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error(t('assignments.submitError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const openGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || null);
    setFeedback(submission.feedback || '');
    setShowGradeModal(true);
  };
  
  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    try {      setGrading(true);
      
      await gradeSubmission(
        selectedSubmission.id, 
        grade || 0, 
        feedback
      );
      
      // Update the submission in the list
      if (assignment && assignment.submissions) {
        const updatedSubmissions = assignment.submissions.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, grade: grade || 0, feedback, gradedAt: new Date().toISOString() }
            : s
        );
        
        setAssignment({
          ...assignment,
          submissions: updatedSubmissions
        });
        
        // Update user submission if it's the one graded
        if (userSubmission && userSubmission.id === selectedSubmission.id) {
          setUserSubmission({
            ...userSubmission,
            grade: grade || 0,
            feedback,
            gradedAt: new Date().toISOString()
          });
        }
      }
        setShowGradeModal(false);
      toast.success(t('assignments.gradeSuccess'));
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error(t('assignments.gradeError'));
    } finally {
      setGrading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">{t('assignments.notFound')}</h2>
        <Link
          to="/dashboard"
          className="text-primary hover:underline"
        >
          {t('dashboard.backToDashboard')}
        </Link>
      </div>
    );
  }

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isAssignmentCreator = assignment.creatorId === user?.id;
  const isPastDue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const canSubmit = !isPastDue && !userSubmission && user?.role === 'STUDENT';
  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/classes/${assignment.classId}`}
          className="text-primary hover:underline mb-2 inline-block"
        >
          ← {t('assignments.backToClass')}
        </Link>
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        <div className="flex flex-wrap gap-4 items-center mt-2">
          <div className="text-muted-foreground">
            {t('assignments.points')}: {assignment.totalPoints}
          </div>
          {assignment.dueDate && (
            <div className={`flex items-center gap-1 ${
              isPastDue ? 'text-red-500' : 'text-green-500'
            }`}>
              <FiClock className="text-lg" />
              {isPastDue 
                ? t('assignments.pastDue', { date: new Date(assignment.dueDate).toLocaleDateString() })
                : t('assignments.dueDate') + ': ' + new Date(assignment.dueDate).toLocaleDateString()}
            </div>
          )}
          {isAssignmentCreator && (
            <Link
              to={`/assignments/${assignment.id}/edit`}
              className="flex items-center gap-2 text-primary"
            >
              <FiEdit2 className="text-lg" />
              {t('common.edit')}
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Assignment Content */}
          <div className="bg-card rounded-lg shadow-md p-6 mb-6">
            <div className="prose max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{assignment.description}</div>
            </div>
            
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">{t('assignments.attachments')}</h3>
                <div className="space-y-2">
                  {assignment.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/70 transition"
                    >
                      <FiFile className="text-primary" size={24} />
                      <div className="overflow-hidden">
                        <div className="truncate">{attachment.filename}</div>
                        <div className="text-xs text-muted-foreground">{attachment.fileType}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Student Submission Form */}
          {canSubmit && (
            <div className="bg-card rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('assignments.yourSubmission')}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    {t('assignments.submissionContent')}
                  </label>
                  <textarea
                    id="content"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('assignments.submissionPlaceholder')}
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">
                    {t('assignments.attachments')}
                  </label>
                  
                  <div className="border-2 border-dashed border-border rounded-md p-6 text-center mb-4">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <FiUpload size={32} className="text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-1">{t('assignments.dragAndDrop')}</p>
                      <p className="text-sm text-muted-foreground">{t('assignments.maxFileSize')}</p>
                    </label>
                  </div>
                  
                  {submissionAttachments.length > 0 && (
                    <div className="space-y-2">
                      {submissionAttachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FiFile className="text-primary" size={20} />
                            <div className="overflow-hidden">
                              <div className="truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FiX size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-70"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        {t('common.submitting')}
                      </span>
                    ) : (
                      t('assignments.submit')
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* User's Submission */}
          {userSubmission && (
            <div className="bg-card rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{t('assignments.yourSubmission')}</h2>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${userSubmission.isLate ? 'text-amber-500' : 'text-green-500'}`}>
                    {userSubmission.isLate ? (
                      <>
                        <FiAlertCircle className="text-lg" />
                        <span>{t('assignments.submittedLate')}</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-lg" />
                        <span>{t('assignments.submitted')}</span>
                      </>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {new Date(userSubmission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {userSubmission.content && (
                <div className="prose max-w-none dark:prose-invert mb-6">
                  <div className="whitespace-pre-wrap">{userSubmission.content}</div>
                </div>
              )}
              
              {userSubmission.attachments && userSubmission.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">{t('assignments.attachments')}</h3>
                  <div className="space-y-2">
                    {userSubmission.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/70 transition"
                      >
                        <FiFile className="text-primary" size={24} />
                        <div className="overflow-hidden">
                          <div className="truncate">{attachment.filename}</div>
                          <div className="text-xs text-muted-foreground">{attachment.fileType}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
                {userSubmission.grade !== undefined && userSubmission.grade !== null && (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{t('assignments.grade')}</h3>
                    <div className="font-medium">
                      {userSubmission.grade} / {assignment.totalPoints}
                    </div>
                  </div>
                  
                  {userSubmission.feedback && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('assignments.feedback')}</h4>
                      <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                        {userSubmission.feedback}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* All Submissions (Teacher View) */}
          {isTeacher && hasSubmissions && (
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('assignments.allSubmissions')}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">{t('assignments.student')}</th>
                      <th className="text-left py-3 px-4">{t('assignments.submissionDate')}</th>
                      <th className="text-left py-3 px-4">{t('assignments.status')}</th>
                      <th className="text-left py-3 px-4">{t('assignments.grade')}</th>
                      <th className="text-left py-3 px-4">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.submissions?.map((submission) => (
                      <tr key={submission.id} className="border-b border-border">
                        <td className="py-3 px-4">{submission.student?.name}</td>
                        <td className="py-3 px-4">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 ${
                            submission.isLate ? 'text-amber-500' : 'text-green-500'
                          }`}>
                            {submission.isLate ? (
                              <>
                                <FiAlertCircle className="text-sm" />
                                <span>{t('assignments.late')}</span>
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="text-sm" />
                                <span>{t('assignments.onTime')}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {submission.grade !== null 
                            ? `${submission.grade} / ${assignment.totalPoints}`
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/assignments/${assignment.id}/submissions/${submission.id}`}
                              className="text-primary hover:underline"
                            >
                              {t('assignments.view')}
                            </Link>
                            <button
                              onClick={() => openGradeModal(submission)}
                              className="text-primary hover:underline"
                            >
                              {submission.grade !== null 
                                ? t('assignments.updateGrade') 
                                : t('assignments.grade')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('assignments.details')}</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('assignments.createdBy')}</div>
                <div>{assignment.creator?.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">{t('assignments.class')}</div>
                <Link to={`/classes/${assignment.classId}`} className="text-primary hover:underline">
                  {assignment.class?.name}
                </Link>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">{t('assignments.totalPoints')}</div>
                <div>{assignment.totalPoints}</div>
              </div>
              
              {assignment.dueDate && (
                <div>
                  <div className="text-sm text-muted-foreground">{t('assignments.dueDate')}</div>
                  <div className={isPastDue ? 'text-red-500' : ''}>
                    {new Date(assignment.dueDate).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-muted-foreground">{t('assignments.createdAt')}</div>
                <div>{new Date(assignment.createdAt).toLocaleDateString()}</div>
              </div>
              
              {isTeacher && (
                <div>
                  <div className="text-sm text-muted-foreground">{t('assignments.status')}</div>
                  <div className={`flex items-center gap-1 ${
                    assignment.isPublished ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    {assignment.isPublished ? (
                      <>
                        <FiCheckCircle className="text-sm" />
                        <span>{t('assignments.published')}</span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="text-sm" />
                        <span>{t('assignments.draft')}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {isTeacher && (
                <div>
                  <div className="text-sm text-muted-foreground">{t('assignments.submissions')}</div>
                  <div>{assignment.submissions?.length || 0}</div>
                </div>
              )}
            </div>
          </div>
            {/* Student Grade (if available) */}
          {user?.role === 'STUDENT' && userSubmission && userSubmission.grade !== undefined && userSubmission.grade !== null && (
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('assignments.yourGrade')}</h2>
              
              <div className="text-center mb-4"><div className="text-4xl font-bold">
                  {userSubmission.grade} / {assignment.totalPoints}
                </div>
                <div className="text-muted-foreground text-sm">
                  {Math.round(((userSubmission.grade || 0) / assignment.totalPoints) * 100)}%
                </div>
              </div>
              
              {userSubmission.gradedAt && (
                <div className="text-sm text-center text-muted-foreground mb-4">
                  {t('assignments.gradedOn')}: {new Date(userSubmission.gradedAt).toLocaleDateString()}
                </div>
              )}
              
              {userSubmission.feedback && (
                <div>
                  <h3 className="font-medium mb-2">{t('assignments.feedback')}</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {userSubmission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {t('assignments.gradeSubmission', { student: selectedSubmission.student?.name })}
            </h2>
            
            <div className="mb-4">
              <label htmlFor="grade" className="block text-sm font-medium mb-1 required">
                {t('assignments.grade')} (0-{assignment.totalPoints})
              </label>
              <input
                id="grade"
                type="number"
                min={0}
                max={assignment.totalPoints}
                value={grade || ''}
                onChange={(e) => setGrade(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                {t('assignments.feedback')}
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('assignments.feedbackPlaceholder')}
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGradeModal(false)}
                className="px-4 py-2 border border-border rounded-md"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleGrade}
                disabled={grading || grade === null}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-70"
              >
                {grading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {t('common.saving')}
                  </span>
                ) : (
                  t('assignments.saveGrade')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
