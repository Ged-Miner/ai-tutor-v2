'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';
import { Session } from 'next-auth';

interface NavigationProps {
  session: Session;
}

export function Navigation({ session }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="border-b bg-white">
      {/* Desktop & Mobile Header */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">AI Tutor</h1>

          {/* User Info - Hidden on Mobile */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session.user.role?.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {session.user.role === 'ADMIN' && (
            <>
              <NavLink href="/dashboard" label="Dashboard" icon="dashboard" />
              <NavLink href="/admin/users" label="Manage Users" icon="users" />
              <NavLink
                href="/admin/courses"
                label="Manage Courses"
                icon="courses"
              />
              <NavLink
                href="/admin/prompts"
                label="System Prompts"
                icon="prompts"
              />
              <NavLink
                href="/admin/settings"
                label="Settings"
                icon="settings"
              />
            </>
          )}

          {session.user.role === 'TEACHER' && (
            <>
              <NavLink href="/teacher/courses" label="My Courses" icon="courses" />
              <NavLink
                href="/teacher/pending-transcripts"
                label="Pending Transcripts"
                icon="transcripts"
              />
            </>
          )}

          {session.user.role === 'STUDENT' && (
            <>
              <NavLink href="/student/courses" label="My Courses" icon="courses" />
              <NavLink
                href="/student/enroll"
                label="Enroll in Course"
                icon="enroll"
              />
            </>
          )}
        </nav>

        {/* Desktop Sign Out - Hidden on Mobile */}
        <div className="hidden md:block">
          <SignOutButton />
        </div>

        {/* Mobile Hamburger Button - Shown on Mobile Only */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <XIcon />
          ) : (
            <HamburgerIcon />
          )}
        </button>
      </div>

      {/* Mobile Menu - Slides down when open */}
      {isOpen && (
        <div className="md:hidden border-t bg-gray-50">
          {/* Mobile User Info */}
          <div className="px-4 py-3 sm:px-6 border-b">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session.user.role?.toLowerCase()}
            </p>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col py-2">
            {session.user.role === 'ADMIN' && (
              <>
                <MobileNavLink
                  href="/dashboard"
                  label="Dashboard"
                  icon="dashboard"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/admin/users"
                  label="Manage Users"
                  icon="users"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/admin/courses"
                  label="Manage Courses"
                  icon="courses"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/admin/prompts"
                  label="System Prompts"
                  icon="prompts"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/admin/settings"
                  label="Settings"
                  icon="settings"
                  onClick={closeMenu}
                />
              </>
            )}

            {session.user.role === 'TEACHER' && (
              <>
                <MobileNavLink
                  href="/teacher/courses"
                  label="My Courses"
                  icon="courses"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/teacher/pending-transcripts"
                  label="Pending Transcripts"
                  icon="transcripts"
                  onClick={closeMenu}
                />
              </>
            )}

            {session.user.role === 'STUDENT' && (
              <>
                <MobileNavLink
                  href="/student/courses"
                  label="My Courses"
                  icon="courses"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/student/enroll"
                  label="Enroll in Course"
                  icon="enroll"
                  onClick={closeMenu}
                />
              </>
            )}
          </nav>

          {/* Mobile Sign Out Button */}
          <div className="border-t px-4 py-3 sm:px-6">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: string;
}

function NavLink({ href, label, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      <IconComponent name={icon} />
      <span>{label}</span>
    </Link>
  );
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  icon: string;
  onClick: () => void;
}

function MobileNavLink({ href, label, icon, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 sm:px-6 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      <IconComponent name={icon} />
      <span>{label}</span>
    </Link>
  );
}

interface IconComponentProps {
  name: string;
}

function IconComponent({ name }: IconComponentProps) {
  const iconProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'h-5 w-5',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    case 'users':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case 'courses':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case 'prompts':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'transcripts':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'enroll':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      );
    case 'settings':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
