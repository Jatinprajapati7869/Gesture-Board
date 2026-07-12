import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OnboardingPage } from '@/pages/OnboardingPage';

describe('OnboardingPage', () => {
  it('offers a no-camera continuation path', () => {
    const onComplete = vi.fn();

    render(<OnboardingPage onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /continue without camera/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});