# Decisions Summary

This is a quick, plain-language guide to the decisions recorded in the full decision records. Read the matching full record when a decision affects a requirement, system behavior, or the formal SRS.

## 001 Modern tools for the system

The team chose React, TypeScript, Tailwind CSS, and Laravel instead of plain web pages and plain PHP. These tools reduce repetitive work and help catch mistakes before clinic staff encounter them.

## 002 QR lookup as a Staff quick-action

QR lookup was made part of the Staff workflow instead of creating a separate QR-only account type. After identifying a student, Staff can move straight to recording a visit, emergency, or profile view.

## 003 PE and Sports Instructor access

PE and Sports Instructors are included now, with mobile-only read access to a student's full profile and visit or incident history. They cannot change records, and each view is recorded so access remains accountable.

## 004 Privacy on shared screens

Lists and dashboard areas that show several students use Student Numbers instead of names, reducing what a passer-by can learn at a glance. A deliberate one-student lookup, such as a QR result or profile, shows the student's name normally.

## 005 Student Number format

Each student receives a system-made number in the form YYYY-NNNNN, based on the enrollment year and a sequence number. It is easy to type, avoids confusing letters, and is used for QR codes and lookups.

## 006 Interface-first work

The team will show usable screens with sample data before finishing the supporting system work behind them. This lets the client give feedback early, when changes are easier to make.

## 007 Chosen technology tools

The team selected dependable tools that fit the school's low-cost, low-spec environment, including Vite, Laravel Sanctum, XAMPP, QR tools that work on iPhones, and lightweight charts. The choices favor long-term support and practical use over newer-looking options that could fail or add weight.

## 008 Organizing the user-facing app

The user-facing app is grouped by clinic feature so everything for one area stays together. QR work is split into desktop, mobile, and shared parts because those experiences differ, while the scanner itself is reused.

## 009 Organizing the server side

The server side follows the same feature-based organization as the user-facing app. This keeps each clinic area easier to understand and change without adding a large extra system for managing modules.

## 010 What list rows may show

Multi-student lists may show a visit reason, complaint, or description beside the Student Number. Keeping names out is considered enough protection for a casual glance while still giving the nurse useful context.

## 011 Dashboard scope

The Clinic Overview Dashboard is view-only for both Staff and Admin, so changes happen in the proper module rather than from a summary screen. It shows five key totals, while Staff also get links to start a visit and check backup status.

## 012 Clear page addresses

Each screen uses a normal, readable web address such as a student or visit page rather than a temporary screen switch. This makes navigation clearer, keeps roles on the right screens, and lets the app load only the screen needed.

## 013 Simple data loading for now

The app uses one small helper for loading information, showing errors, and trying again, with each feature keeping its own request functions. This is enough for the current stage and can be reconsidered later if more complex shared data handling is needed.

## 014 One shared set of sample data

All sample records live in one central file and are accessed through one shared layer. This keeps screens consistent, lets actions appear across related screens during a demonstration, and keeps fake personal information clearly fictional.

## 015 One-week sessions without an idle timer

Every role stays signed in for up to one week, then must sign in again; there is no automatic sign-out just because someone is inactive. The team chose this to avoid interrupting urgent work, while recognizing that users must still sign out on a shared workstation.

## 016 Audit Log Viewer

Staff and Admin can review a read-only history of important actions, filter it, and print or export it when needed. PE and Sports Instructors cannot open it, and nobody can change or delete its entries.

## 017 Audit entry summary and actor role

Audit Log rows now show the actor's role, the kind of record beside a short identifier, and an optional "what changed" line on updates (e.g. "Updated allergies"). The line names fields only, never values, so no health details appear in the list.

## 018 Medicines given come out of real stock

A visit's treatment is now two parts: free-text treatment notes, and medicines and supplies picked from inventory. Saving takes them out of stock in one all-or-nothing save; expired items can't be given, and going over stock warns instead of blocking. Editing a visit corrects stock with new adjustment records instead of rewriting old ones. Staff can also adjust stock for disposal, damage, or a recount, and the expiration date changes only through Restock.
