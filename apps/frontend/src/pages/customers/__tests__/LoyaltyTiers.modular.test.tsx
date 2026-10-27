/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import LoyaltyTiers from '../LoyaltyTiers';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTiers = [
  {
    id: 'tier-1',
    name: 'VIP Customer',
    nameAr: 'عميل مميز',
    minPoints: 1000,
    maxPoints: 5000,
    discountPercent: 15,
    freeShipping: true,
    targetGovernorates: ['القاهرة', 'الجيزة'],
    conditions: {
      minOrders: 5,
      minSpent: 3000,
    },
    color: '#8b5cf6',
    icon: 'crown',
    customersCount: 42,
    programId: 'prog-1',
    benefits: ['شحن مجاني', 'خصم 15%'],
  },
  {
    id: 'tier-2',
    name: 'Gold Member',
    nameAr: 'عضو ذهبي',
    minPoints: 500,
    maxPoints: 999,
    discountPercent: 5,
    freeShipping: false,
    targetGovernorates: [],
    conditions: null,
    color: '#f59e0b',
    icon: 'trophy',
    customersCount: 120,
    programId: 'prog-1',
    benefits: ['خصم 5%'],
  },
];

const mockPrograms = [
  {
    id: 'prog-1',
    name: 'Main Loyalty Program',
    nameAr: 'برنامج الولاء الرئيسي',
    type: 'TIERS',
    status: 'ACTIVE',
  },
];

describe('LoyaltyTiers Modular Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();

    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url === '/hr/customer-loyalty/loyalty-config') {
        return { data: { success: true, data: { tiers: { enabled: true } } } } as any;
      }
      if (url === '/hr/customer-loyalty/tiers') {
        return { data: { success: true, data: mockTiers } } as any;
      }
      if (url === '/hr/customer-loyalty/programs') {
        return { data: { success: true, data: mockPrograms } } as any;
      }
      return { data: { success: true, data: [] } } as any;
    });

    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, message: 'Created successfully' },
    } as any);
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { success: true, data: { tiers: { enabled: false } } },
    } as any);
    vi.mocked(apiClient.delete).mockResolvedValue({
      data: { success: true },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders header, tiers enablement switch, and action buttons', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('مستويات العملاء (Tiers)')).toBeInTheDocument();
      expect(
        screen.getByText('تعريف شرائح العملاء ومميزات كل مستوى (VIP, Gold, etc.)')
      ).toBeInTheDocument();
      expect(screen.getByText('تفعيل نظام المستويات')).toBeInTheDocument();
      expect(screen.getByText('مفعّل')).toBeInTheDocument();
      expect(screen.getByText('مستوى جديد')).toBeInTheDocument();
      expect(screen.getByText('قالب جاهز')).toBeInTheDocument();
      expect(screen.getByText('تحديث')).toBeInTheDocument();
    });
  });

  it('displays loyalty tier cards with points, counts, and benefits', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
      expect(screen.getByText('عضو ذهبي')).toBeInTheDocument();
      expect(screen.getByText('42 عميل')).toBeInTheDocument();
      expect(screen.getByText('120 عميل')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
      expect(screen.getByText('شحن مجاني على كافة الطلبات')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('شرط مركب')).toBeInTheDocument();
      expect(screen.getByText(/القاهرة، الجيزة/)).toBeInTheDocument();
      expect(screen.getByText('جميع المحافظات')).toBeInTheDocument();
    });
  });

  it('filters tiers by governorate', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
      expect(screen.getByText('عضو ذهبي')).toBeInTheDocument();
    });

    // Click "عام لكافة المحافظات"
    const globalBtn = screen.getByRole('button', { name: /عام لكافة المحافظات/ });
    fireEvent.click(globalBtn);

    // Only tier-2 has empty targetGovernorates
    expect(screen.getByText('عضو ذهبي')).toBeInTheDocument();
    expect(screen.queryByText('عميل مميز')).not.toBeInTheDocument();

    // Click "الكل"
    const allBtn = screen.getByRole('button', { name: /الكل/ });
    fireEvent.click(allBtn);

    expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    expect(screen.getByText('عضو ذهبي')).toBeInTheDocument();
  });

  it('opens add tier modal and fills form', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /مستوى جديد/ });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { level: 2, name: 'إنشاء مستوى جديد' })).toBeInTheDocument();

    const nameEnInput = screen.getByPlaceholderText('e.g. VIP');
    const nameArInput = screen.getByPlaceholderText('مثلاً: كبار الشخصيات');

    fireEvent.change(nameEnInput, { target: { value: 'Platinum Elite' } });
    fireEvent.change(nameArInput, { target: { value: 'بلاتينيوم إيليت' } });

    const submitBtn = screen.getByRole('button', { name: 'حفظ التغييرات' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/hr/customer-loyalty/tiers',
        expect.objectContaining({
          name: 'Platinum Elite',
          nameAr: 'بلاتينيوم إيليت',
        })
      );
    });
  });

  it('opens edit tier modal on clicking edit button', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByRole('button', { name: /تعديل المستوى/ });
    fireEvent.click(editBtns[0]);

    expect(screen.getByRole('heading', { level: 2, name: 'تعديل المستوى' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('VIP Customer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('عميل مميز')).toBeInTheDocument();
  });

  it('opens preset modal and allows selecting preset template', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    });

    const presetBtn = screen.getByRole('button', { name: /قالب جاهز/ });
    fireEvent.click(presetBtn);

    expect(screen.getByRole('heading', { level: 2, name: 'قوالب مستويات جاهزة' })).toBeInTheDocument();
    expect(screen.getByText('كلاسيك — 5 مستويات')).toBeInTheDocument();
    expect(screen.getByText('نجوم — 10 مستويات')).toBeInTheDocument();
    expect(screen.getByText('VIP — 3 مستويات')).toBeInTheDocument();

    const classicPreset = screen.getByText('كلاسيك — 5 مستويات');
    fireEvent.click(classicPreset);

    const applyBtn = screen.getByRole('button', { name: 'إنشاء المستويات' });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/hr/customer-loyalty/tiers/preset',
        expect.objectContaining({
          presetKey: 'classic5',
          programId: 'prog-1',
        })
      );
    });
  });

  it('calls delete endpoint when trash button is clicked', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('حذف المستوى');
    fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledWith('هل أنت متأكد من حذف هذا المستوى؟');
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/hr/customer-loyalty/tiers/tier-1');
    });
  });

  it('toggles tier enablement switch', async () => {
    render(<LoyaltyTiers />);

    await waitFor(() => {
      expect(screen.getByText('مفعّل')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(window.confirm).toHaveBeenCalledWith('هل تريد إيقاف تفعيل نظام المستويات؟');
    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/hr/customer-loyalty/loyalty-config', {
        tiersEnabled: false,
      });
    });
  });
});
