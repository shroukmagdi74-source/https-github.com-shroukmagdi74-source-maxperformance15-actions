import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopilotHeader } from '../CopilotHeader';
import type { SpecialistAgent } from '../specialists';

jest.mock('../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: { approvals: [], count: 0 } }),
  },
}));

describe('CopilotHeader - Agent Selection & Switcher', () => {
  const mockSpecialists: SpecialistAgent[] = [
    {
      id: 'agent_salim',
      slug: 'executive-assistant-agent',
      name: 'سليم — المساعد التنفيذي',
      role: 'EXECUTIVE_ASSISTANT',
      title: 'المساعد التنفيذي',
      description: 'متابعة العمليات',
      badge: 'المساعد التنفيذي',
      icon: '⚡',
      isDefault: true,
      suggestedPrompts: [],
    },
    {
      id: 'agent_media_buyer',
      slug: 'facebook-media-buyer-agent',
      name: 'الميديا باير المحترف',
      role: 'MEDIA_BUYER',
      title: 'خبير إعلانات',
      description: 'إدارة الميزانيات',
      badge: 'إعلانات وتسويق',
      icon: '📊',
      isDefault: false,
      suggestedPrompts: [],
    },
  ];

  const defaultProps = {
    selectedAgent: mockSpecialists[0],
    onSelectAgent: jest.fn(),
    specialists: mockSpecialists,
    contextReason: null,
    pageContextLabel: 'لوحة التحكم | MaxP',
    showSessionsList: false,
    onToggleSessionsList: jest.fn(),
    onNewSession: jest.fn(),
    onClose: jest.fn(),
    activeSessionId: 'sess_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders selected agent name and default badge', () => {
    render(<CopilotHeader {...defaultProps} />);
    expect(screen.getByText('سليم — المساعد التنفيذي')).toBeInTheDocument();
    expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
  });

  it('opens specialist agents dropdown on click and allows switching agent', () => {
    const onSelectAgent = jest.fn();
    render(<CopilotHeader {...defaultProps} onSelectAgent={onSelectAgent} />);

    // Dropdown is not visible initially
    expect(screen.queryByText('تبديل وكيل الذكاء الاصطناعي')).not.toBeInTheDocument();

    // Click header to open dropdown
    const switchButton = screen.getByTitle('اضغط لاختيار أو تبديل الوكيل');
    fireEvent.click(switchButton);

    // Dropdown opens
    expect(screen.getByText('تبديل وكيل الذكاء الاصطناعي')).toBeInTheDocument();
    expect(screen.getByText('الميديا باير المحترف')).toBeInTheDocument();

    // Click on "الميديا باير المحترف"
    fireEvent.click(screen.getByText('الميديا باير المحترف'));

    // onSelectAgent is called with the media buyer agent
    expect(onSelectAgent).toHaveBeenCalledTimes(1);
    expect(onSelectAgent).toHaveBeenCalledWith(mockSpecialists[1]);
  });
});
