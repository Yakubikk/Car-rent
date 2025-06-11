import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX } from 'react-icons/fi';
import { createClass } from '@/api/classes';

interface ClassFormData {
  name: string;
  description?: string;
  subject?: string;
}

const CreateClass = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ClassFormData>();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('classes.imageSizeError'));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('classes.imageTypeError'));
        return;
      }
      
      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
  };
  
  const onSubmit = async (data: ClassFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.subject) {
        formData.append('subject', data.subject);
      }
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      const response = await createClass(formData);
      
      toast.success(t('classes.createSuccess'));
      navigate(`/classes/${response.class.id}`);
    } catch {
      toast.error(t('classes.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t('classes.createTitle')}</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-1 required">
              {t('classes.name')}
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: true })}
              className={`w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-border'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t('classes.namePlaceholder')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{t('common.fieldRequired')}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              {t('classes.subject')}
            </label>
            <input
              id="subject"
              type="text"
              {...register('subject')}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('classes.subjectPlaceholder')}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('classes.description')}
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('classes.descriptionPlaceholder')}
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              {t('classes.coverImage')}
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition"
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="coverImage"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <FiUpload size={32} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-1">{t('classes.dragAndDrop')}</p>
                  <p className="text-sm text-muted-foreground">{t('classes.maxFileSize')}</p>
                </label>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/classes')}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted transition"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  {t('common.creating')}
                </span>
              ) : (
                t('classes.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;
