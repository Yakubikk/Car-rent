import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import type { Class, User, Assignment, Post } from "@/types";
import {
  getClassById,
  getClassStudents,
  removeStudentFromClass,
} from "@/api/classes";
import { getClassAssignments } from "@/api/assignments";
import { getClassPosts } from "@/api/posts";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  FiUsers,
  FiBook,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";

// Tab type
type TabType = "stream" | "assignments" | "students";

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, subscribeToClass, unsubscribeFromClass } = useSocket();

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

  // Fetch tab data with useCallback to avoid dependency issues
  const fetchTabData = useCallback(
    async (tab: TabType) => {
      if (!id) return;

      try {
        switch (tab) {
          case "stream": {
            const postsResponse = await getClassPosts(id);
            setPosts(postsResponse);
            break;
          }
          case "assignments": {
            const assignmentsResponse = await getClassAssignments(id);
            setAssignments(assignmentsResponse);
            break;
          }
          case "students": {
            const studentsResponse = await getClassStudents(id);
            setStudents(studentsResponse);
            break;
          }
        }
      } catch (err) {
        console.error(`Error fetching ${tab} data:`, err);
        toast.error(t(`${tab}.fetchError`));
      }
    },
    [id, t]
  );

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const classResponse = await getClassById(id);
        setClassData(classResponse);

        // Load initial data for the default tab
        await fetchTabData("stream");
      } catch (err) {
        console.error("Error fetching class data:", err);
        toast.error(t("classes.fetchError"));
        navigate("/classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();

    // Subscribe to class updates when component mounts
    if (id) {
      subscribeToClass(id);
    }

    // Cleanup subscription on unmount
    return () => {
      if (id) {
        unsubscribeFromClass(id);
      }
    };
  }, [id, navigate, t, subscribeToClass, unsubscribeFromClass, fetchTabData]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Handle new post added to the class
    const handleNewPost = (newPost: Post) => {
      if (newPost.classId === id) {
        setPosts((prev) => [newPost, ...prev]);

        // Show notification if not on stream tab
        if (activeTab !== "stream") {
          toast.success(t("posts.newPostNotification"));
        }
      }
    };

    // Handle new assignment added to the class
    const handleNewAssignment = (newAssignment: Assignment) => {
      if (newAssignment.classId === id) {
        setAssignments((prev) => [newAssignment, ...prev]);

        // Show notification if not on assignments tab
        if (activeTab !== "assignments") {
          toast.success(t("assignments.newAssignmentNotification"));
        }
      }
    };

    // Handle student enrollment update
    const handleStudentEnrolled = (data: {
      classId: string;
      student: User;
    }) => {
      if (data.classId === id) {
        setStudents((prev) => [...prev, data.student]);

        // Show notification if not on students tab
        if (activeTab !== "students") {
          toast.success(
            t("classes.newStudentNotification", { name: data.student.name })
          );
        }
      }
    };

    // Register event listeners
    socket.on("class:post:new", handleNewPost);
    socket.on("class:assignment:new", handleNewAssignment);
    socket.on("class:student:enrolled", handleStudentEnrolled);

    // Cleanup on unmount
    return () => {
      socket.off("class:post:new", handleNewPost);
      socket.off("class:assignment:new", handleNewAssignment);
      socket.off("class:student:enrolled", handleStudentEnrolled);
    };
  }, [socket, id, activeTab, t]);

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    await fetchTabData(tab);
  };

  const handleRemoveStudent = async () => {
    if (!id || !studentToRemove) return;

    try {
      await removeStudentFromClass(id, studentToRemove);
      setStudents(students.filter((student) => student.id !== studentToRemove));
      toast.success(t("classes.studentRemoved"));
    } catch (err) {
      console.error("Error removing student:", err);
      toast.error(t("classes.removeStudentError"));
    } finally {
      setDeleteModalOpen(false);
      setStudentToRemove(null);
    }
  };

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const isClassOwner = classData?.ownerId === user?.id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">{t("classes.notFound")}</h2>
        <Link to="/classes" className="text-primary hover:underline">
          {t("classes.backToClasses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Class Header */}
      <div
        className="relative rounded-lg shadow-md overflow-hidden mb-6"
        style={{
          backgroundImage: classData.coverImage
            ? `url(${classData.coverImage})`
            : "linear-gradient(to right, var(--primary), var(--primary-dark))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative p-8 text-white">
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
              {classData.subject && (
                <p className="text-xl mb-2">{classData.subject}</p>
              )}
              <p className="opacity-80">{classData.description}</p>
            </div>

            {isClassOwner && (
              <Link
                to={`/classes/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-md hover:bg-opacity-90 transition"
              >
                <FiEdit2 className="text-lg" />
                {t("common.edit")}
              </Link>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm opacity-80">
              {t("classes.enrollmentCode")}:{" "}
              <span className="font-medium">{classData.enrollmentCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Class Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex">
          <button
            onClick={() => handleTabChange("stream")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === "stream"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiFileText className="text-lg" />
            {t("classes.stream")}
          </button>
          <button
            onClick={() => handleTabChange("assignments")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === "assignments"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiBook className="text-lg" />
            {t("classes.assignments")}
          </button>
          <button
            onClick={() => handleTabChange("students")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === "students"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiUsers className="text-lg" />
            {t("classes.students")}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Stream Tab (Posts) */}
        {activeTab === "stream" && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold">
                {t("classes.announcements")}
              </h2>

              {isTeacher && (
                <button
                  onClick={() => navigate(`/classes/${id}/posts/create`)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                >
                  <FiPlus className="text-lg" />
                  {t("posts.create")}
                </button>
              )}
            </div>

            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-card rounded-lg shadow-sm p-6"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {post.author?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{post.author?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {post.authorId === user?.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/classes/${id}/posts/${post.id}/edit`)
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button className="text-red-500 hover:text-red-600">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {post.title && (
                      <h3 className="text-lg font-medium mb-2">{post.title}</h3>
                    )}
                    <p className="mb-4">{post.content}</p>

                    {post.attachments && post.attachments.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="text-sm font-medium">
                          {t("posts.attachments")}
                        </div>
                        <div className="space-y-2">
                          {post.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/70 transition"
                            >
                              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                                <FiFileText className="text-primary" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="truncate">
                                  {attachment.filename}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {attachment.fileType}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        {post._count?.comments} {t("posts.comments")}
                      </div>
                      <Link
                        to={`/classes/${id}/posts/${post.id}`}
                        className="text-primary hover:underline"
                      >
                        {t("posts.viewDetails")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <FiFileText className="mx-auto text-5xl text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("posts.noPostsTitle")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("posts.noPostsDescription")}
                </p>
                {isTeacher && (
                  <button
                    onClick={() => navigate(`/classes/${id}/posts/create`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition mx-auto"
                  >
                    <FiPlus className="text-lg" />
                    {t("posts.create")}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold">
                {t("assignments.title")}
              </h2>

              {isTeacher && (
                <Link
                  to={`/classes/${id}/assignments/create`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                >
                  <FiPlus className="text-lg" />
                  {t("assignments.create")}
                </Link>
              )}
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    to={`/assignments/${assignment.id}`}
                    className="block bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-medium">
                        {assignment.title}
                      </h3>
                      <div className="text-sm font-medium">
                        {assignment.totalPoints} {t("assignments.points")}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {assignment.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">
                        {t("assignments.createdBy")}: {assignment.creator?.name}
                      </div>
                      {assignment.dueDate && (
                        <div
                          className={`font-medium ${
                            new Date(assignment.dueDate) < new Date()
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {t("assignments.dueDate")}:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <FiBook className="mx-auto text-5xl text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("assignments.noAssignmentsTitle")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("assignments.noAssignmentsDescription")}
                </p>
                {isTeacher && (
                  <Link
                    to={`/classes/${id}/assignments/create`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition mx-auto"
                  >
                    <FiPlus className="text-lg" />
                    {t("assignments.create")}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold">
                {t("classes.students")} ({students.length})
              </h2>
            </div>

            {students.length > 0 ? (
              <div className="bg-card rounded-lg shadow-sm">
                <div className="grid grid-cols-12 p-4 font-medium text-sm border-b border-border">
                  <div className="col-span-6">{t("classes.studentName")}</div>
                  <div className="col-span-4">{t("classes.email")}</div>
                  <div className="col-span-2">{t("common.actions")}</div>
                </div>

                {students.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-12 p-4 border-b border-border last:border-b-0 items-center"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{student.name}</span>
                    </div>
                    <div className="col-span-4 text-muted-foreground">
                      {student.email}
                    </div>
                    <div className="col-span-2">
                      {isClassOwner && student.id !== user?.id && (
                        <button
                          onClick={() => {
                            setStudentToRemove(student.id);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <FiUsers className="mx-auto text-5xl text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("classes.noStudentsTitle")}
                </h3>
                <p className="text-muted-foreground">
                  {t("classes.noStudentsDescription")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Remove Student Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {t("classes.confirmRemoveStudent")}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {t("classes.removeStudentWarning")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setStudentToRemove(null);
                }}
                className="px-4 py-2 border border-border rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRemoveStudent}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {t("common.remove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails;
