import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import { createAssignment } from '@/api/assignments';

interface AssignmentFormData {
  title: string;
  description: string;
  totalPoints?: number;
  isPublished?: boolean;
}

const CreateAssignment = () => {
  const { classId } = useParams<{ classId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AssignmentFormData>();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (max 10MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error(t('assignments.fileSizeError'));
        return;
      }
      
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (data: AssignmentFormData) => {
    if (!classId) return;
    
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('totalPoints', (data.totalPoints || 100).toString());
      formData.append('isPublished', isPublished.toString());
      formData.append('classId', classId);
      
      if (dueDate) {
        formData.append('dueDate', dueDate.toISOString());
      }
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await createAssignment(formData);
      
      toast.success(t('assignments.createSuccess'));
      navigate(`/assignments/${response.assignment.id}`);
    } catch (error) {
      toast.error(t('assignments.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t('assignments.createTitle')}</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-1 required">
              {t('assignments.title')}
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: true })}
              className={`w-full px-3 py-2 border ${
                errors.title ? 'border-red-500' : 'border-border'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t('assignments.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{t('common.fieldRequired')}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-1 required">
              {t('assignments.description')}
            </label>
            <textarea
              id="description"
              {...register('description', { required: true })}
              rows={6}
              className={`w-full px-3 py-2 border ${
                errors.description ? 'border-red-500' : 'border-border'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t('assignments.descriptionPlaceholder')}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{t('common.fieldRequired')}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium mb-1">
                {t('assignments.totalPoints')}
              </label>
              <input
                id="totalPoints"
                type="number"
                {...register('totalPoints', { 
                  min: 1,
                  valueAsNumber: true,
                })}
                defaultValue={100}
                min={1}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                {t('assignments.dueDate')}
              </label>              <DatePicker
                selected={dueDate}
                onChange={(date: Date | null) => setDueDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholderText={t('assignments.dueDatePlaceholder')}
              />
            </div>
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
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
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
          
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span>{t('assignments.publishImmediately')}</span>
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('assignments.publishNote')}
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/classes/${classId}`)}
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
                t('assignments.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
