import React from "react";
import { render, screen } from "@testing-library/react";
import { useCountUp } from "../csbHooks";

const Probe: React.FC<{ target: number }> = ({ target }) => {
  const { ref, value } = useCountUp(target, 900);
  return <span ref={ref}>{value}</span>;
};

describe("useCountUp", () => {
  // SLUG-style regression: the bundle landing shipped «الإجمالي = 0 ج.م» to visitors
  // because the counter's initial state was 0 and the IntersectionObserver never fired.
  it("starts from the real total instead of zero", () => {
    render(<Probe target={2936} />);
    expect(screen.getByText("2936")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("keeps the real total when IntersectionObserver is unavailable", () => {
    const original = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    // @ts-expect-error — simulate an environment without IO (prerender/no-hydration case)
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    try {
      render(<Probe target={1937} />);
      expect(screen.getByText("1937")).toBeInTheDocument();
    } finally {
      (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = original;
    }
  });
});
