"use client";

import { navItems } from "@/app/reusables";
import { ShoppingBag, X, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Button from "../buttons/Buttons";
import Modal from "../Modal/Modal";
import AdminLogin from "./AdminLogin";
import UserLogin from "./UserLogin";
import UserSignUp from "./UserSignUp";

const NavBar = ({ cartComponent, cartItemCount = 0 }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [userLogin, setUserLogin] = useState(false);
  const [userSignUp, setUserSignUp] = useState(false);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeModal = () => {
    setAdmin(false);
    setUserLogin(false);
    setUserSignUp(false);
  };

  const handleAdminClick = () => {
    setAdmin(true);
  };

  const switchToSignUp = () => {
    setUserLogin(false);
    setUserSignUp(true);
  };

  const switchToLogin = () => {
    setUserLogin(true);
    setUserSignUp(false);
  };

  const handleCheckout = () => {
    setUserLogin(true);
    setIsPanelOpen(false);
  };

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isPanelOpen) {
          setIsPanelOpen(false);
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        if (admin || userLogin || userSignUp) {
          closeModal();
        }
      }
    };

    if (isPanelOpen || isMobileMenuOpen || admin || userLogin || userSignUp) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isPanelOpen, isMobileMenuOpen, admin, userLogin, userSignUp]);

  const getModalTitle = () => {
    if (admin) return "Admin Login";
    if (userLogin) return "Login";
    if (userSignUp) return "Sign Up";
    return "";
  };

  return (
    <>
      <Modal
        isOpen={admin || userLogin || userSignUp}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {admin && <AdminLogin onClose={closeModal} />}
        {userLogin && (
          <UserLogin toggle={switchToSignUp} onClose={closeModal} />
        )}
        {userSignUp && (
          <UserSignUp toggle={switchToLogin} onClose={closeModal} />
        )}
      </Modal>

      <header className="py-5 backdrop-blur-3xl rounded-full sticky top-0 z-10 bg-white/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo */}
            <button
              onClick={handleAdminClick}
              className="flex-shrink-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
              aria-label="Admin access"
            >
              <Image
                className="w-16 h-16 bg-white rounded-full"
                src="/images/img (2).png"
                width={64}
                height={64}
                alt="YEAH Logo"
                priority
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-8"
              role="navigation"
            >
              {navItems.map((link, i) => (
                <Link
                  href={link.link}
                  key={i}
                  className="hover:text-gray-600 transition-colors uppercase font-medium text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button & Cart Button */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Toggle mobile menu"
              >
                <Menu size={20} />
              </button>

              {/* Cart Button */}
              <div className="flex-shrink-0 relative">
                <Button
                  onClick={togglePanel}
                  className="h-12 w-12 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  icon={<ShoppingBag size={20} />}
                  aria-label={`Open cart${
                    cartItemCount > 0 ? ` (${cartItemCount} items)` : ""
                  }`}
                />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="p-6 h-full flex flex-col">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h2 id="mobile-menu-title" className="text-xl font-bold">
              Menu
            </h2>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1" role="navigation">
            <ul className="space-y-4">
              {navItems.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.link}
                    onClick={toggleMobileMenu}
                    className="block py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors uppercase font-medium text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t pt-4">
            <button
              onClick={() => {
                setUserLogin(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Cart Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="p-6 h-full flex flex-col">
          {/* Cart Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h2 id="cart-title" className="text-xl font-bold">
              Your Cart
              {cartItemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({cartItemCount} {cartItemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
            <button
              onClick={togglePanel}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Content - Left empty for component injection */}
          <div className="flex-1 overflow-y-auto">
            {cartComponent || (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">
                  Add items to get started
                </p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-4 text-lg font-semibold">
              <span>Subtotal</span>
              <span>$0.00</span>
            </div>
            <Button
              className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              text="Checkout"
              onClick={handleCheckout}
              disabled={cartItemCount === 0}
              aria-describedby="checkout-description"
            />
            <p id="checkout-description" className="sr-only">
              Proceed to checkout with your cart items
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Overlay for Cart */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default NavBar;
