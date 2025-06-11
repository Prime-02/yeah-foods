"use client"

import { navItems } from "@/app/reusables";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const NavBar = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <>
      <header className="py-5 backdrop-blur-3xl rounded-full sticky top-0 z-50 bg-white/80">
        <div className="flex justify-around items-center">
          <span>
            <Image
              className="w-12 h-12"
              src={"/images/logo.jpeg"}
              width={100}
              height={100}
              alt="YEAH Logo"
            />
          </span>
          <div className="flex items-center gap-8">
            {navItems.map((link, i) => (
              <Link 
                href={link.link} 
                key={i}
                className="hover:text-gray-600 transition-colors uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <button 
            onClick={togglePanel}
            className="h-12 w-12 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={25} />
          </button>
        </div>
      </header>

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button 
              onClick={togglePanel}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Cart content goes here */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-gray-500 text-center py-10">
              Your cart is currently empty
            </p>
            {/* You would map through cart items here */}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span>$0.00</span>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-30"
          onClick={togglePanel}
        />
      )}
    </>
  );
};

export default NavBar;