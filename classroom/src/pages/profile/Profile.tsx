import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { FiUser, FiUpload, FiX } from "react-icons/fi";
import { updateUser, updateProfile } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/auth";

interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  phone?: string;
}

const Profile = () => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        bio: user.profile?.bio || "",
        phone: user.profile?.phone || "",
      });

      if (user.profile?.avatar) {
        setAvatarPreview(user.profile.avatar);
      }
    }
  }, [user, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("profile.imageSizeError"));
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("profile.imageTypeError"));
        return;
      }

      setAvatar(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAvatar(null);
    setAvatarPreview(user?.profile?.avatar || null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Update user data (name and email)
      if (user.name !== data.name || user.email !== data.email) {
        await updateUser(user.id, {
          name: data.name,
          email: data.email,
        });
      }
      // Update profile data (bio, phone, avatar)
      const formData = new FormData();

      if (data.bio !== user.profile?.bio) {
        formData.append("bio", data.bio || "");
      }

      if (data.phone !== user.profile?.phone) {
        formData.append("phone", data.phone || "");
      }

      if (avatar) {
        formData.append("avatar", avatar);
      }

      // Only make the API call if there are changes
      if (
        formData.has("bio") ||
        formData.has("phone") ||
        formData.has("avatar")
      ) {
        await updateProfile(formData);
        await getCurrentUser();
      }
      toast.success(t("profile.updateSuccess"));

      // Refresh user data is handled by the auth context
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(t("profile.updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-card rounded-lg shadow-md p-6 h-fit">
          <div className="flex flex-col items-center">
            {avatarPreview ? (
              <div className="relative mb-4">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full hover:bg-opacity-90 transition"
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <FiUser size={48} className="text-primary" />
              </div>
            )}

            <div className="text-xl font-semibold mb-1">{user?.name}</div>
            <div className="text-muted-foreground mb-4">{user?.email}</div>

            <div className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition w-full">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="avatar"
                className="flex items-center gap-2 cursor-pointer w-full justify-center"
              >
                <FiUpload size={18} />
                {t("profile.changeAvatar")}
              </label>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-card rounded-lg shadow-md p-6 md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 required"
              >
                {t("profile.name")}
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: true })}
                className={`w-full px-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-border"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {t("common.fieldRequired")}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 required"
              >
                {t("profile.email")}
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
                className={`w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-border"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.email?.type === "required" && (
                <p className="text-red-500 text-sm mt-1">
                  {t("common.fieldRequired")}
                </p>
              )}
              {errors.email?.type === "pattern" && (
                <p className="text-red-500 text-sm mt-1">
                  {t("profile.invalidEmail")}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                {t("profile.bio")}
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("profile.bioPlaceholder")}
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                {t("profile.phone")}
              </label>
              <input
                id="phone"
                type="text"
                {...register("phone")}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("profile.phonePlaceholder")}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {t("common.saving")}
                  </span>
                ) : (
                  t("common.save")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
