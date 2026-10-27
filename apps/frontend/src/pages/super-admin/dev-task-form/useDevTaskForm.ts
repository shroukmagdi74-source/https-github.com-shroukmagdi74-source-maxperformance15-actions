import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../../../utils/urlHelper';
import tokenManager from '../../../utils/tokenManager';
import { Attachment } from '../../../types/tasks';
import {
  type Project,
  type TeamMember,
  type Release,
  type DevTaskFormData,
  COMPONENT_OPTIONS,
} from './types';

const getAccessToken = (): string | null => tokenManager.getAccessToken();

const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

const getDefaultFormData = (): DevTaskFormData => ({
  title: '',
  description: '',
  businessValue: '',
  acceptanceCriteria: '',
  type: 'FEATURE',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  component: '',
  assigneeId: '',
  projectId: '',
  releaseId: '',
  dueDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })(),
  startDate: new Date().toISOString().split('T')[0],
  estimatedHours: '1',
  tags: '',
  gitBranch: '',
  companyId: '',
  ticketId: '',
  campaignId: '',
  targetAudience: '',
  budgetAllocation: '',
  expectedROI: '',
  relatedLinks: [],
});

export const useDevTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  const [formData, setFormData] = useState<DevTaskFormData>(getDefaultFormData());
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Attachment[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState<any>(null);
  const [watchers, setWatchers] = useState<string[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const fetchInitialData = useCallback(async () => {
    try {
      const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
      const [projectsRes, teamRes, releasesRes] = await Promise.all([
        fetch(buildApiUrl('super-admin/dev/projects'), { headers }),
        fetch(buildApiUrl('super-admin/dev/team'), { headers }),
        fetch(buildApiUrl('super-admin/dev/releases'), { headers }),
      ]);

      const [projectsData, teamData, releasesData] = await Promise.all([
        projectsRes.json(),
        teamRes.json(),
        releasesRes.json(),
      ]);

      if (projectsData.success) setProjects(projectsData.data);
      if (teamData.success) setTeamMembers(teamData.data);
      if (releasesData.success) setReleases(releasesData.data);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(buildApiUrl('super-admin/dev/settings'), {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  }, []);

  const fetchTask = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`super-admin/dev/tasks/${id}`), {
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      });

      const data = await response.json();
      if (data.success) {
        const task = data.data;
        const normalizedComponent = task.component ? task.component.toLowerCase() : '';
        setFormData({
          title: task.title || '',
          description: task.description || '',
          businessValue: task.businessValue || '',
          acceptanceCriteria: task.acceptanceCriteria || '',
          type: task.type || 'FEATURE',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'BACKLOG',
          component: normalizedComponent,
          assigneeId: task.assigneeId || '',
          projectId: task.projectId || '',
          releaseId: task.releaseId || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          startDate: task.startDate ? task.startDate.split('T')[0] : '',
          estimatedHours: task.estimatedHours?.toString() || '',
          tags: task.tags?.join(', ') || '',
          gitBranch: task.gitBranch || '',
          companyId: task.companyId || '',
          ticketId: task.ticketId || '',
          campaignId: task.campaignId || '',
          targetAudience: task.targetAudience || '',
          budgetAllocation: task.budgetAllocation?.toString() || '',
          expectedROI: task.expectedROI?.toString() || '',
          relatedLinks: Array.isArray(task.relatedLinks) ? task.relatedLinks : [],
        });

        if (task.watchers && Array.isArray(task.watchers)) {
          const watcherIds = task.watchers.map((w: any) => w.memberId || w);
          setWatchers(watcherIds);
        }

        if (task.attachments && Array.isArray(task.attachments)) {
          setExistingImages(task.attachments);
        }
      } else {
        setError(data.error || 'فشل في جلب المهمة');
      }
    } catch {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInitialData();
    fetchSettings();

    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFormData(prev => ({ ...prev, status: statusParam }));
    }
  }, [fetchInitialData, fetchSettings, searchParams]);

  useEffect(() => {
    if (isEdit) {
      fetchTask();
    }
  }, [isEdit, fetchTask]);

  const derivedComponentOptions = useMemo(() => {
    const defaultValues = new Set(COMPONENT_OPTIONS.map(o => o.value));
    const customOptions = settings?.componentMappings
      ? Object.keys(settings.componentMappings)
          .filter(k => !defaultValues.has(k))
          .map(k => ({ value: k, label: k }))
      : [];
    return [...COMPONENT_OPTIONS, ...customOptions];
  }, [settings]);

  useEffect(() => {
    if (settings && settings.componentMappings && formData.component) {
      const componentKey = Object.keys(settings.componentMappings).find(
        k => k.toLowerCase() === formData.component.toLowerCase()
      );

      const autoAssignee = componentKey ? settings.componentMappings[componentKey] : null;

      if (autoAssignee && !formData.assigneeId) {
        const memberExists = teamMembers.find(m => m.id === autoAssignee);
        if (memberExists) {
          setFormData(prev => ({ ...prev, assigneeId: autoAssignee }));
        }
      }
    }
  }, [formData.component, formData.assigneeId, settings, teamMembers]);

  useEffect(() => {
    const createdUrls: string[] = [];

    const loadImages = async () => {
      const token = getAccessToken();
      if (!token) return;

      const urls: Record<string, string> = {};

      for (const file of existingImages) {
        try {
          const imageUrl = file.fileUrl || `/uploads/dev-tasks/${file.fileName}`;
          const response = await fetch(imageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            urls[file.id] = objectUrl;
            createdUrls.push(objectUrl);
          }
        } catch (err) {
          console.error('Error loading image:', err);
        }
      }

      setImageBlobUrls(urls);
    };

    if (existingImages.length > 0) {
      loadImages();
    }

    return () => {
      createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [existingImages]);

  const handleChange = useCallback((field: keyof DevTaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        if (file.size > 20 * 1024 * 1024) {
          setError(`حجم الملف ${file.name} يجب أن يكون أقل من 20 ميجابايت`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          setError(`الملف ${file.name} يجب أن يكون صورة`);
          continue;
        }
        validFiles.push(file);
      }

      if (existingImages.length + selectedImages.length + validFiles.length > 10) {
        setError('الحد الأقصى 10 صور');
        return;
      }

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setSelectedImages(prev => [...prev, ...validFiles]);
      setError(null);
    },
    [existingImages.length, selectedImages.length]
  );

  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback((attachmentId: string) => {
    setImagesToDelete(prev => [...prev, attachmentId]);
    setExistingImages(prev => prev.filter(img => img.id !== attachmentId));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        setError('العنوان مطلوب');
        return;
      }
      if (!formData.description.trim()) {
        setError('الوصف مطلوب');
        return;
      }
      if (!formData.assigneeId) {
        setError('المسؤول مطلوب');
        return;
      }
      if (!formData.dueDate) {
        setError('تاريخ الاستحقاق مطلوب');
        return;
      }

      try {
        setSaving(true);
        setError(null);
        const token = getAccessToken();

        const payload = {
          ...formData,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
          tags: formData.tags
            ? formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
            : [],
          assigneeId: formData.assigneeId || null,
          projectId: formData.projectId || null,
          releaseId: formData.releaseId || null,
          dueDate: formData.dueDate || null,
          startDate: formData.startDate || null,
          component: formData.component || null,
          gitBranch: formData.gitBranch || null,
          companyId: formData.companyId || null,
          ticketId: formData.ticketId || null,
          campaignId: formData.campaignId || null,
          targetAudience: formData.targetAudience || null,
          budgetAllocation: formData.budgetAllocation ? parseFloat(formData.budgetAllocation) : null,
          expectedROI: formData.expectedROI ? parseFloat(formData.expectedROI) : null,
          checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
          watchers,
          relatedLinks: formData.relatedLinks,
        };

        const url = isEdit ? buildApiUrl(`super-admin/dev/tasks/${id}`) : buildApiUrl('super-admin/dev/tasks');
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success) {
          const taskId = data.data.id;

          if (selectedImages.length > 0 && taskId) {
            const uploadFormData = new FormData();
            selectedImages.forEach(image => {
              uploadFormData.append('files', image);
            });

            await fetch(buildApiUrl(`super-admin/dev/tasks/${taskId}/attachments`), {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: uploadFormData,
            });
          }

          if (imagesToDelete.length > 0) {
            await Promise.all(
              imagesToDelete.map(attachmentId =>
                fetch(buildApiUrl(`super-admin/dev/tasks/attachments/${attachmentId}`), {
                  method: 'DELETE',
                  headers: getAuthHeaders(),
                })
              )
            );
          }

          navigate('/super-admin/dev-tasks');
        } else {
          setError(data.error || 'فشل في حفظ المهمة');
        }
      } catch {
        setError('فشل في الاتصال بالخادم');
      } finally {
        setSaving(false);
      }
    },
    [formData, checklistItems, watchers, selectedImages, imagesToDelete, isEdit, id, navigate]
  );

  return {
    id,
    isEdit,
    loading,
    saving,
    error,
    setError,
    projects,
    teamMembers,
    releases,
    formData,
    setFormData,
    settings,
    watchers,
    setWatchers,
    checklistItems,
    setChecklistItems,
    selectedImages,
    imagePreviews,
    existingImages,
    imageBlobUrls,
    newLinkTitle,
    setNewLinkTitle,
    newLinkUrl,
    setNewLinkUrl,
    derivedComponentOptions,
    handleChange,
    handleImageChange,
    removeImage,
    removeExistingImage,
    handleSubmit,
  };
};

export default useDevTaskForm;
