/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CafeThemeDemo from "../CafeThemeDemo";

describe("CafeThemeDemo", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders storefront sections correctly", () => {
    render(<CafeThemeDemo />);

    // Brand and Hero
    expect(screen.getByText(/Sweet Moments/i)).toBeTruthy();
    expect(screen.getByText(/Start Here\./i)).toBeTruthy();

    // Menu and categories
    expect(screen.getByText("Our Menu")).toBeTruthy();
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Signature Cakes" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hot Brews" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pastries" })).toBeTruthy();

    // Products
    expect(screen.getByText("Aatis Cake")).toBeTruthy();
    expect(screen.getByText("Lermi Delight")).toBeTruthy();
    expect(screen.getByText("Classic Blend")).toBeTruthy();

    // About section
    expect(screen.getByText("Müt Coffee")).toBeTruthy();

    // Footer
    expect(screen.getByText("Join our newsletter")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeTruthy();
  });

  it("filters products when category is selected", () => {
    render(<CafeThemeDemo />);

    // Initially all products are shown
    expect(screen.getByText("Aatis Cake")).toBeTruthy();
    expect(screen.getByText("Classic Blend")).toBeTruthy();

    // Filter by Hot Brews
    fireEvent.click(screen.getByRole("button", { name: "Hot Brews" }));

    // Classic Blend should still be there, but Aatis Cake should not
    expect(screen.getByText("Classic Blend")).toBeTruthy();
    expect(screen.queryByText("Aatis Cake")).toBeNull();

    // Switch back to All
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Aatis Cake")).toBeTruthy();
  });

  it("opens quick view modal and adds item to cart", () => {
    render(<CafeThemeDemo />);

    // Click on ADD TO CART button on the first product to open Quick View
    const addButtons = screen.getAllByRole("button", { name: /ADD TO CART/i });
    fireEvent.click(addButtons[0]);

    // Quick View Modal should show choice of preparation
    expect(screen.getByText(/Choice of Preparation:/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Regular" })).toBeTruthy();

    // In modal, click ADD TO CART to actually add to cart
    const modalAddButtons = screen.getAllByRole("button", { name: /ADD TO CART/i });
    const modalAddButton = modalAddButtons[modalAddButtons.length - 1];
    fireEvent.click(modalAddButton);

    // Toast appears
    expect(screen.getByText(/Added .* to cart/i)).toBeTruthy();
  });

  it("opens cart drawer and transitions to checkout view", () => {
    render(<CafeThemeDemo />);

    // Add product to cart first via quick view
    const addButtons = screen.getAllByRole("button", { name: /ADD TO CART/i });
    fireEvent.click(addButtons[0]);
    const modalAddButtons = screen.getAllByRole("button", { name: /ADD TO CART/i });
    fireEvent.click(modalAddButtons[modalAddButtons.length - 1]);

    // Open Cart Drawer via Cart button
    const cartButton = screen.getByLabelText("Shopping Cart");
    fireEvent.click(cartButton);

    // Cart Drawer should show Your Order and subtotal
    expect(screen.getByText("Your Order")).toBeTruthy();
    const checkoutButton = screen.getByRole("button", { name: /Proceed to Checkout/i });
    expect(checkoutButton).toBeTruthy();

    // Click Proceed to Checkout
    fireEvent.click(checkoutButton);

    // Now in Checkout View
    expect(screen.getByText("Return to Store")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Secure Checkout" })).toBeTruthy();

    // Return back to store
    fireEvent.click(screen.getByRole("button", { name: "Return to Store" }));
    expect(screen.getByText(/Sweet Moments/i)).toBeTruthy();
  });
});
