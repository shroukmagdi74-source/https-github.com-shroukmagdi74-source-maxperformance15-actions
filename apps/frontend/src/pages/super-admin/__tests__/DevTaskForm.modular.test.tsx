// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DevTaskForm from '../DevTaskForm';

vi.mock('../../../utils/tokenManager', () => ({
  default: {
    getAccessToken: () => 'mock-token',
    createAuthHeaders: (headers: any = {}) => ({
      Authorization: 'Bearer mock-token',
      ...headers,
    }),
  },
}));

vi.mock('../../../utils/urlHelper', () => ({
  buildApiUrl: (path: string) => `http://localhost:3000/api/${path}`,
}));

vi.mock('../../../i18n', () => ({
  __esModule: true,
  default: { dir: () => 'rtl', language: 'ar' },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const renderWithRouter = (initialRoute = '/super-admin/dev-tasks/new') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/super-admin/dev-tasks/new" element={<DevTaskForm />} />
        <Route path="/super-admin/dev-tasks/:id/edit" element={<DevTaskForm />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('DevTaskForm Modular Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('projects')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [{ id: 'proj-1', name: 'MaxP V2', color: '#3b82f6' }],
            }),
        });
      }
      if (url.includes('team')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                { id: 'mem-1', name: 'Ahmed Dev', email: 'ahmed@test.com', avatar: null },
                { id: 'mem-2', name: 'Sara Lead', email: 'sara@test.com', avatar: null },
              ],
            }),
        });
      }
      if (url.includes('releases')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [{ id: 'rel-1', version: '2.5.0', name: 'Spring Release' }],
            }),
        });
      }
      if (url.includes('settings')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                componentMappings: { frontend: 'mem-1' },
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: 'task-101' } }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders task creation form and header', async () => {
    renderWithRouter();

    expect(screen.getByText('إنشاء مهمة جديدة')).toBeInTheDocument();
    expect(screen.getByText('تفاصيل المهمة الأساسية')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('مثال: ترقية بوابة الدفع الإلكتروني...')).toBeInTheDocument();
    expect(screen.getByText('القيمة التجارية (Business Value)')).toBeInTheDocument();
    expect(screen.getByText('معايير القبول (Acceptance Criteria)')).toBeInTheDocument();
    expect(screen.getByText('قوائم التحقق المبدئية (Checklists)')).toBeInTheDocument();
    expect(screen.getByText('الروابط والمراجع (Related Links)')).toBeInTheDocument();
  });

  it('allows filling title, description and business value', async () => {
    renderWithRouter();

    const titleInput = screen.getByPlaceholderText('مثال: ترقية بوابة الدفع الإلكتروني...');
    fireEvent.change(titleInput, { target: { value: 'Fix OAuth Callback' } });
    expect(titleInput).toHaveValue('Fix OAuth Callback');

    const descTextarea = screen.getByPlaceholderText('وصف تفصيلي للمهمة والمتطلبات التقنية...');
    fireEvent.change(descTextarea, { target: { value: 'Fix token exchange error on redirect' } });
    expect(descTextarea).toHaveValue('Fix token exchange error on redirect');

    const businessVal = screen.getByPlaceholderText(
      'لماذا نقوم بهذا العمل؟ ما الأثر والعائد المتوقع على الأعمال والعملاء؟'
    );
    fireEvent.change(businessVal, { target: { value: 'Prevents login dropoffs' } });
    expect(businessVal).toHaveValue('Prevents login dropoffs');
  });

  it('adds and removes checklist items', async () => {
    renderWithRouter();

    const checklistInput = screen.getByPlaceholderText('أضف بنداً جديداً للقائمة...');
    fireEvent.change(checklistInput, { target: { value: 'Write unit tests' } });

    const addButtons = screen.getAllByRole('button', { name: 'إضافة' });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Write unit tests')).toBeInTheDocument();

    const removeBtn = screen.getByLabelText('Remove checklist item');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Write unit tests')).not.toBeInTheDocument();
  });

  it('adds and removes related links', async () => {
    renderWithRouter();

    const titleInput = screen.getByPlaceholderText('عنوان الرابط (مثال: توثيق API)');
    const urlInput = screen.getByPlaceholderText('https://...');
    fireEvent.change(titleInput, { target: { value: 'Figma Design' } });
    fireEvent.change(urlInput, { target: { value: 'https://figma.com/file/123' } });

    const addButtons = screen.getAllByRole('button', { name: 'إضافة' });
    // Second "إضافة" button is for links
    fireEvent.click(addButtons[1]);

    expect(screen.getByText('Figma Design')).toBeInTheDocument();
    expect(screen.getByText('https://figma.com/file/123')).toBeInTheDocument();

    const removeLinkBtn = screen.getByLabelText('Remove link');
    fireEvent.click(removeLinkBtn);

    expect(screen.queryByText('Figma Design')).not.toBeInTheDocument();
  });

  it('validates required fields on submission', async () => {
    renderWithRouter();

    const submitBtn = screen.getByText('إنشاء المهمة');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('العنوان مطلوب')).toBeInTheDocument();
    });
  });

  it('submits valid task payload', async () => {
    renderWithRouter();

    // Fill title
    fireEvent.change(screen.getByPlaceholderText('مثال: ترقية بوابة الدفع الإلكتروني...'), {
      target: { value: 'Payment Gateway Upgrade' },
    });

    // Fill description
    fireEvent.change(screen.getByPlaceholderText('وصف تفصيلي للمهمة والمتطلبات التقنية...'), {
      target: { value: 'Full upgrade to Stripe v3' },
    });

    // Select assignee
    await waitFor(() => {
      expect(screen.getAllByText('Ahmed Dev')[0]).toBeInTheDocument();
    });
    const selects = screen.getAllByRole('combobox');
    const assigneeSelect = selects.find(s =>
      Array.from(s.children).some(opt => opt.textContent === 'Ahmed Dev')
    );
    if (assigneeSelect) {
      fireEvent.change(assigneeSelect, { target: { value: 'mem-1' } });
    }

    const submitBtn = screen.getByText('إنشاء المهمة');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/super-admin/dev/tasks',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
