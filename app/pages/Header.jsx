"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "../about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = user?.publicMetadata?.role;
  const redirectPath = userRole === "admin" ? "/admin" : "/dashboard";

  const handleButtonClick = () => {
    setIsLoading(true);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-10">
      <nav className="container mx-auto lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-2xl font-bold text-white gap-2"
          >
            <Image src={"/logo.png"} width={100} height={50} alt="logo" />
            <h2 className="hidden font-light md:block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              Ai Shorts
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="font-normal text-lg hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <Link 
              href={redirectPath} 
              onClick={handleButtonClick}
              className="hidden md:block"
            >
              <Button
                className=" shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Get Started"
                )}
              </Button>
            </Link>
            <UserButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-blue-600 hover:text-blue-800"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-blue-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Add Get Started button to mobile menu */}
            <Link
              href={redirectPath}
              onClick={() => {
                handleButtonClick();
                setIsMobileMenuOpen(false);
              }}
              className="block"
            >
              <Button
                className="w-full rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Get Started"}
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}