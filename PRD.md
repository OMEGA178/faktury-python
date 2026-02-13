# Planning Guide

Professional invoice and payment tracking system for Gadowski sp. z o.o. that manages company invoices, tracks payment status, maintains payment history, scores companies based on payment reliability, tracks fuel expenses, monitors transport routes with distance calculations, provides comprehensive financial summaries, generates detailed business reports (weekly, monthly, quarterly), automatically creates monthly reports, displays advanced financial analytics with charts including break-even analysis, profit margin tracking, fuel cost efficiency monitoring, manages driver assignments to invoices, and features a toggle-able dark mode with excellent readability. Built as a Progressive Web App (PWA) for web browsers with **maximum performance optimization** using React best practices. **System starts clean without sample data** and includes comprehensive session tracking that sends detailed before/after email reports when users close the application.

**Performance Optimizations Implemented:**
- ✅ All event handlers wrapped in `useCallback` to prevent unnecessary re-renders
- ✅ All computed values memoized with `useMemo` for efficient calculations  
- ✅ Normalized data structures (companies as Record<string, Company>) for O(1) lookups
- ✅ Singleton Intl.NumberFormat and Intl.DateTimeFormat instances to avoid recreation
- ✅ Functional state updates to prevent stale closures and race conditions
- ✅ Stable keys for list rendering to minimize DOM manipulation
- ✅ Optimized parseInt calls with explicit radix parameter
- ✅ Performance monitoring utilities for benchmarking critical operations

**Experience Qualities**:
1. **Professional** - Modern, clean corporate design with excellent contrast and readability that conveys trust and financial seriousness appropriate for B2B invoice management and logistics tracking
2. **Efficient** - Quick data entry and status updates with clear visual separation between outstanding and paid invoices, bold typography for easy scanning, and intuitive navigation
3. **Reliable** - Multi-stage confirmation process, comprehensive audit trail with session tracking, automated financial calculations prevent errors, maintain data integrity, and email reports provide complete activity history

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a comprehensive business management system with invoice tracking, payment management, driver management with invoice assignments, fuel expense monitoring, route tracking with AI calculations, financial reporting with multiple time periods (weekly/monthly/quarterly), automatic report generation, advanced analytics dashboard with charts, break-even analysis, profit margin tracking, session tracking with email reports, dark mode theming, and clean data initialization - features that require sophisticated state management and data visualization.

## Essential Features

### Invoice Entry
- **Functionality**: Add new invoice with company name, NIP (tax ID), amount, payment deadline, payment term, optional contact phone number, optional transport locations (loading/unloading cities and addresses), optional attachments (invoice/cargo images), and optional driver assignment
- **Purpose**: Capture all necessary information for tracking receivables, maintaining contact information, monitoring transport routes, and tracking which driver handled each delivery
- **Trigger**: User clicks "Add Invoice" button
- **Progression**: Click Add → Enter company details (name, NIP, phone) → Enter amount, payment term, and deadline → Select assigned driver (optional) → Enter loading/unloading locations (optional) → Upload images (optional) → Submit → Distance automatically calculated if locations provided → Invoice appears in Outstanding section with driver information
- **Success criteria**: Invoice saved to persistent storage with all data including contact phone, locations, calculated distance, assigned driver, and images, displayed in Outstanding list with driver name visible

### Driver Management
- **Functionality**: Add, manage, and assign drivers to invoices
- **Purpose**: Track which driver handled each transport job, maintain driver contact information, and enable driver performance analysis
- **Trigger**: User clicks "Add Driver" button or selects driver when adding invoice
- **Progression**: Click Add Driver → Enter driver name, phone, and optional email → Submit → Driver added to system → Available for selection in invoice form → Driver name displayed on assigned invoices
- **Success criteria**: Drivers saved to system, selectable when adding/editing invoices, driver information visible on invoice cards, full driver roster maintained

### Payment Status Management
- **Functionality**: Mark invoice as paid with three-stage confirmation to prevent accidental updates
- **Purpose**: Safely update payment status while maintaining data integrity
- **Trigger**: User clicks "Mark as Paid" on an outstanding invoice
- **Progression**: Click Mark as Paid → Confirmation dialog 1 → Confirm → Confirmation dialog 2 → Confirm → Final confirmation with amount displayed → Confirm → Invoice moves to Paid section with payment date recorded
- **Success criteria**: Invoice transferred to Paid section, payment date recorded, payment score calculated (on-time vs late), no accidental confirmations possible

### Payment History Tracking
- **Functionality**: Maintain complete payment history for each company including all invoices, amounts, dates, and timeliness
- **Purpose**: Build reliability profile and enable informed business decisions
- **Trigger**: View company details or history panel
- **Progression**: Click company name → View modal opens → Display all invoices (paid and outstanding) → Show payment dates, amounts, deadlines → Calculate and display payment score
- **Success criteria**: Complete chronological history visible, payment patterns clear, score accurately reflects reliability

### Company Scoring System
- **Functionality**: Assign points based on payment behavior (on-time payments earn points, late payments reduce score)
- **Purpose**: Quickly identify reliable vs problematic clients
- **Trigger**: Automatic calculation when invoice marked as paid
- **Progression**: Invoice confirmed paid → Compare payment date to deadline → Award points (+10 on-time, -5 late) → Update company total score → Display badge/indicator
- **Success criteria**: Score updates immediately, visual indicators show reliability level, historical data preserved

### Outstanding vs Paid Separation
- **Functionality**: Clear visual separation between invoices awaiting payment and completed payments
- **Purpose**: Immediate status overview and prioritization of collection efforts
- **Trigger**: Automatic sorting based on payment status
- **Progression**: Page loads → Outstanding invoices on left/top → Paid invoices on right/bottom → Color coding and badges differentiate status
- **Success criteria**: Clear visual hierarchy, easy to scan both sections, counts displayed for each section

### Invoice Editing (Post-Payment)
- **Functionality**: Edit paid invoice details including company info, amounts, dates, contact info, locations, and attachments
- **Purpose**: Correct errors or update information after payment confirmation without data loss
- **Trigger**: User clicks "Edit" button on paid invoice card
- **Progression**: Click Edit → Edit dialog opens with current data → Modify fields → Save changes → Distance recalculated if locations changed → Updated invoice displayed with preserved payment status
- **Success criteria**: All invoice fields editable post-payment, payment status and history preserved, company records updated accordingly, distance recalculated when needed

### Fuel Expense Tracking
- **Functionality**: Record fuel purchases with date, amount paid, and liters purchased
- **Purpose**: Track fuel expenses to calculate actual profit margins and monitor operational costs
- **Trigger**: User clicks "Add Fuel" in Fuel tab
- **Progression**: Click Add Fuel → Enter date of fueling → Enter amount paid → Enter liters purchased → Price per liter automatically calculated → Submit → Fuel entry added to history
- **Success criteria**: Fuel entries saved with automatic price calculation, displayed in chronological order, contribute to financial summary

### Route Distance Calculation
- **Functionality**: Automatically calculate road distance between loading and unloading locations using AI
- **Purpose**: Track actual kilometers traveled for each transport job
- **Trigger**: Automatic when loading and unloading cities are provided
- **Progression**: User enters both cities → System calls LLM with city names → Distance returned and saved → Displayed on invoice card
- **Success criteria**: Distance accurately calculated for Polish cities, displayed in kilometers, preserved with invoice data

### Financial Summary Dashboard
- **Functionality**: Real-time calculation and display of total earnings, outstanding payments, fuel expenses, and net profit
- **Purpose**: Provide instant overview of business financial health
- **Trigger**: Automatic calculation on page load and data updates
- **Progression**: System loads → Calculates total from paid invoices → Calculates total outstanding → Sums fuel expenses → Calculates net (earnings - fuel) → Displays in summary cards
- **Success criteria**: Accurate calculations, real-time updates when data changes, clear visual indicators for profit/loss status

### Payment Deadline Notifications
- **Functionality**: Real-time notification banner showing approaching deadlines (3 days or less) and overdue invoices
- **Purpose**: Proactive payment management and immediate visibility of critical invoices
- **Trigger**: Automatic check on page load and when invoices update
- **Progression**: System checks all outstanding invoices → Identifies invoices due within 3 days or overdue → Displays prominent notification banner → Shows company details and contact phone for quick action
- **Success criteria**: Notifications appear immediately, sorted by urgency, include contact information, update in real-time

### System Time Display
- **Functionality**: Live system date and time display in application header
- **Purpose**: Provide temporal context for payment tracking and deadline awareness
- **Trigger**: Automatic on page load, updates every second
- **Progression**: Page loads → Current date and time displayed in header → Updates continuously → Provides reference for deadline calculations
- **Success criteria**: Accurate system time, updates in real-time, formatted in Polish locale (day of week, date, time)

### Session Tracking with Email Reports
- **Functionality**: Track all user activity during a work session and send comprehensive before/after email report when session ends
- **Purpose**: Provide detailed audit trail of all changes made during work sessions, enable remote monitoring of system usage
- **Trigger**: Session starts automatically on app load, ends when user closes browser/tab
- **Progression**: App loads → Session snapshot created with current data state → User works and makes changes → User closes app → beforeunload event triggers → Final data snapshot captured → Email report generated comparing before/after → Report sent to gadowskispzoo@gmail.com with complete data comparison
- **Success criteria**: Session automatically tracked, all changes logged, email sent on session end, report includes full before/after data comparison for invoices, fuel entries, drivers, and vehicles, session duration calculated and included

### Welcome Email Notification
- **Functionality**: Send welcome email when system is first launched
- **Purpose**: Confirm system is running and email notifications are working
- **Trigger**: First app load (one-time only)
- **Progression**: App loads for first time → System detects no welcome email sent → Sends email to gadowskispzoo@gmail.com → Confirmation toast displayed → Flag set to prevent duplicate emails
- **Success criteria**: Email sent only once on first launch, confirmation displayed to user, email includes system startup confirmation

### Data Export
- **Functionality**: Export invoice and fuel data to PDF or CSV formats for reporting and analysis
- **Purpose**: Enable external reporting, backup, and integration with accounting systems
- **Trigger**: User clicks export button in Outstanding, Paid, or Fuel tabs, or generates full report
- **Progression**: Click Export → Select format (PDF or CSV) → File downloads with formatted data → Success notification appears
- **Success criteria**: Clean, formatted exports with all relevant data, proper Polish formatting (currency, dates), separate exports for outstanding/paid invoices and fuel, full comprehensive report option available

### Report Generation
- **Functionality**: Generate comprehensive PDF reports for weekly, monthly, or quarterly periods with financial analysis
- **Purpose**: Provide detailed business performance reports for accounting, investor communications, and business planning
- **Trigger**: User clicks "Generuj raport" button in header
- **Progression**: Click Generuj raport → Select report type (weekly/monthly/quarterly) → Preview report contents → Click Download → PDF generated with financial summary, invoice list, fuel history, business metrics (break-even, profit margin, fuel price analysis) → File downloads
- **Success criteria**: Professional PDF with company branding, complete financial data for selected period, business plan metrics comparison, proper Polish formatting, tables with all invoices and fuel entries

### Automatic Monthly Report Generation
- **Functionality**: Automatically generate monthly reports at the beginning of each month for the previous month
- **Purpose**: Ensure consistent monthly reporting without manual intervention
- **Trigger**: Automatic check when app loads on first day(s) of new month
- **Progression**: App detects new month → Checks if previous month report exists → Generates report data for last month → Saves to reports history → Available for review
- **Success criteria**: Report generated automatically once per month, stored in persistent storage, contains all previous month's data, does not regenerate duplicate reports

### Balance Analytics Dashboard
- **Functionality**: Advanced financial dashboard with charts showing revenue trends, cost analysis, profit margins, and business plan metrics
- **Purpose**: Visual representation of business performance, track progress toward goals, identify trends and issues
- **Trigger**: User clicks "Bilans" tab
- **Progression**: Click Bilans tab → View dashboard with multiple charts (monthly revenue/costs bar chart, profit distribution pie chart, fuel price trend line chart) → Review business metrics cards (break-even progress, profit margin, average fuel price, current month revenue) → Analyze performance against business plan targets
- **Success criteria**: Interactive charts with Polish labels, real-time data updates, clear visualization of trends, business plan target comparisons, responsive design for all screen sizes

### Break-Even Analysis
- **Functionality**: Calculate and display progress toward monthly break-even point (39,000 PLN based on business plan)
- **Purpose**: Track financial health and ensure business sustainability
- **Trigger**: Automatic calculation in Balance tab
- **Progression**: System calculates current month revenue → Compares to break-even target → Displays remaining amount needed → Shows percentage progress → Alerts if below target
- **Success criteria**: Accurate calculation, clear visual indicator (green if above, yellow/orange if below), warning message when below target with specific amount needed

### Fuel Cost Efficiency Tracking
- **Functionality**: Monitor average fuel price per liter and compare to business plan target (6.50 PLN/L)
- **Purpose**: Identify fuel cost issues and optimize fuel purchasing decisions
- **Trigger**: Automatic calculation when fuel entries exist
- **Progression**: System calculates average price per liter → Compares to target price → Shows variance → Displays historical trend chart → Highlights periods of high/low prices
- **Success criteria**: Accurate average calculation, clear comparison to target, trend visualization showing price changes over time, color-coded indicators (green if at/below target, red if above)

### Profit Margin Monitoring
- **Functionality**: Calculate current profit margin percentage and compare to business plan targets (51-58%)
- **Purpose**: Ensure business maintains healthy profitability
- **Trigger**: Automatic calculation in Balance tab based on current month data
- **Progression**: System calculates total revenue → Subtracts fuel costs → Calculates margin percentage → Compares to target range → Displays with visual indicator
- **Success criteria**: Real-time margin calculation, percentage display, comparison to target range, clear indication if within/outside target range

### Dark Mode Toggle
- **Functionality**: Switch between light and dark color themes with a single click
- **Purpose**: Reduce eye strain during extended use, accommodate different lighting environments, provide user preference control
- **Trigger**: User clicks theme toggle button (moon/sun icon) in header
- **Progression**: Click toggle → Theme preference saved to persistent storage → Dark/light mode class applied to document → All colors transition smoothly → Icon updates to reflect current mode
- **Success criteria**: Instant theme switching, smooth color transitions (300ms), preference persists between sessions, excellent readability in both modes with proper contrast ratios, all components adapt correctly to both themes

### Progressive Web App (PWA) Installation
- **Functionality**: Enable installation of the application on Windows desktop and Android mobile devices as a standalone app
- **Purpose**: Provide native app-like experience, enable offline access, add app to home screen/start menu
- **Trigger**: Browser prompts user to install when visiting the app, or user manually installs from browser menu
- **Progression**: Visit app → Browser detects PWA capability → Install prompt appears → User accepts → App installed to device → Launches in standalone mode without browser UI → Works on both Windows and Android
- **Success criteria**: App manifest configured correctly, installable on Windows (Edge, Chrome) and Android (Chrome, Samsung Internet), launches in standalone mode, proper app metadata and theming, responsive on all screen sizes

## Edge Case Handling

- **Duplicate NIP Entry**: Warning notification if NIP already exists - allow continuing (same company, new invoice) or cancel to review
- **Invalid NIP Format**: Real-time validation for Polish NIP format (10 digits), display error if invalid
- **Past Due Date Entry**: Warning if deadline is in the past when creating invoice, suggest using today's date
- **Empty Fields**: Prevent submission until all required fields completed with clear inline error messages
- **Accidental Cancellation**: If user cancels any confirmation step, invoice remains unchanged with no data loss
- **Missing Payment Date**: Default to current date when marking as paid, allow manual adjustment
- **Large Amount Display**: Format large numbers with spaces (Polish standard: 1 000 000,00 PLN)
- **Search/Filter**: Search by company name or NIP to find specific invoices quickly in large lists
- **Editing Paid Invoices**: Preserve payment status, dates, and scoring when editing paid invoice details
- **Contact Phone Format**: Validate Polish phone numbers (9 digits), format with spaces for readability
- **Image Upload Limits**: Restrict image uploads to 5MB per file, only image file types accepted
- **No Upcoming Deadlines**: Hide notification banner when no invoices are due soon or overdue
- **NIP Change on Edit**: Update company records properly when NIP is changed during invoice editing
- **Location Optional**: Allow invoice creation without locations, show distance only when both cities provided
- **Distance Calculation Failure**: Handle gracefully if AI distance calculation fails, allow invoice to save with 0 or no distance
- **Fuel Entry Deletion**: Confirm deletion to prevent accidental removal of fuel records
- **Zero Liters**: Prevent fuel entry with zero or negative liters/amount
- **Price per Liter Display**: Automatically calculate and display price per liter from amount and liters
- **Empty Fuel List**: Show helpful empty state when no fuel entries exist
- **Financial Summary Edge Cases**: Handle division by zero, display 0.00 when no data available
- **Export with No Data**: Hide export buttons when no data available to export (e.g., no invoices or fuel entries)
- **PDF Generation Errors**: Show error toast if PDF generation fails, ensure proper Polish character encoding
- **CSV Excel Compatibility**: Include UTF-8 BOM for proper Excel compatibility with Polish characters
- **Large Data Exports**: Handle exports with hundreds of entries without performance issues
- **Report Period Selection**: Validate report type selection, show appropriate date ranges for each period type
- **Empty Report Data**: Handle gracefully when selected report period has no data, show informative message
- **Chart Rendering**: Handle edge cases with no data, single data point, or extreme values in charts
- **Auto-Report Timing**: Ensure monthly reports generate only once per month, check on app load and date changes
- **Break-Even Calculation**: Handle zero revenue case, display appropriate messaging when no data available
- **Fuel Price Variance**: Calculate correctly even with single fuel entry, handle zero fuel entries
- **Profit Margin Edge Cases**: Handle zero revenue (division by zero), negative margins, display appropriately
- **Multiple Months Data**: Charts should handle data spanning many months without performance issues
- **Date Range Calculations**: Correctly handle month/quarter boundaries, leap years, year transitions
- **Business Metrics Display**: Show meaningful messages when targets not yet applicable (e.g., first week of business)
- **Chart Tooltips**: Format currency and percentages correctly in chart hover tooltips
- **Responsive Charts**: Charts should resize properly on mobile devices, maintain readability
- **Theme Persistence**: Dark/light mode preference saves to KV storage, loads on app start
- **Theme Transition**: Smooth color transitions when switching themes, no jarring flashes
- **Contrast Validation**: All text maintains WCAG AA contrast ratios in both light and dark modes
- **First Visit**: Default to light mode on first app visit, remember user preference afterward
- **PWA Install Prompt**: Handle install prompt gracefully, don't show repeatedly if dismissed
- **Offline Functionality**: App should load and display cached data when offline (PWA feature)
- **Standalone Mode**: App UI adapts properly when running as installed PWA vs browser tab
- **Session End Failure**: If email fails to send on session end, log error but don't block app closure
- **Session Snapshot Errors**: Handle gracefully if session data can't be captured, continue normal operation
- **Rapid Session Changes**: Prevent multiple session reports if user rapidly closes/reopens app
- **Empty Session Changes**: Send report even if no changes made, showing "no changes" in report
- **Welcome Email Already Sent**: Check localStorage flag to prevent duplicate welcome emails
- **Clean First Launch**: App starts with no sample data, empty state messages displayed appropriately
- **Button Hover Contrast**: All buttons maintain readable text on hover, no white-on-white issues
- **Muted Colors on Hover**: Outline buttons hover to muted background with foreground text, maintaining contrast

## Design Direction

The design should evoke professionalism, clarity, and trustworthiness with a modern, clean aesthetic. The application features a sophisticated dual-theme system with a professional blue-purple color palette that conveys corporate competence while maintaining excellent readability. The light mode uses crisp whites with subtle cool tones for a fresh, professional appearance during daytime use. The dark mode employs deep purples and blues that reduce eye strain during evening work while maintaining the same professional character. Both themes prioritize high contrast, clear typography, and generous spacing to ensure long work sessions remain comfortable and productive. The design is serious and business-focused without being sterile, using bold, saturated colors strategically to highlight important information and guide the user's attention.

## Color Selection

Professional blue-purple palette with high contrast and excellent readability designed for extended financial work.

**Light Mode (Default):**
- **Primary Color**: Deep Purple (oklch(0.45 0.18 260)) - Professional, trustworthy color suggesting reliability and competence
- **Secondary Color**: Royal Blue (oklch(0.50 0.12 220)) for supporting UI elements and accents
- **Background**: Clean Light Gray (oklch(0.98 0.005 240)) - Professional, gentle on eyes
- **Card Background**: Pure White (oklch(1 0 0)) - Maximum clarity and separation
- **Foreground Text**: Near Black (oklch(0.15 0.01 260)) - Excellent readability, strong contrast
- **Accent Color**: Vibrant Teal (oklch(0.55 0.20 180)) - Fresh highlight for important data and CTAs
- **Status Colors**:
  - Success Green (oklch(0.50 0.16 145)) for paid/on-time payments with white text
  - Alert Red (oklch(0.55 0.22 25)) for overdue/late payments with white text
  - Warning Amber (oklch(0.65 0.15 80)) for approaching deadlines with dark text

**Dark Mode:**
- **Primary Color**: Bright Purple (oklch(0.60 0.18 260)) - Maintains brand identity while being easy on eyes in dark
- **Secondary Color**: Medium Blue (oklch(0.55 0.12 220)) - Rich, clear accent
- **Background**: Deep Purple-Gray (oklch(0.16 0.02 260)) - Dark but not pure black, professional feel
- **Card Background**: Dark Slate (oklch(0.20 0.02 260)) - Elevated surfaces with clear depth
- **Foreground Text**: Off-White (oklch(0.92 0.01 240)) - High contrast, comfortable reading
- **Accent Color**: Bright Teal (oklch(0.60 0.20 180)) - Vibrant against dark background
- **Status Colors**:
  - Success Green (oklch(0.55 0.16 145)) with white text
  - Alert Red (oklch(0.60 0.22 25)) with white text
  - Warning Amber (oklch(0.70 0.15 80)) with dark text

**Foreground/Background Pairings (WCAG AA Validated):**
- Light Primary Purple (oklch(0.45 0.18 260)): White text (oklch(0.99 0 0)) - Ratio 8.2:1 ✓
- Light Background (oklch(0.98 0.005 240)): Dark text (oklch(0.15 0.01 260)) - Ratio 14.5:1 ✓
- Dark Primary Purple (oklch(0.60 0.18 260)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓
- Dark Background (oklch(0.16 0.02 260)): Light text (oklch(0.92 0.01 240)) - Ratio 11.4:1 ✓
- Success Green (both modes): White text (oklch(0.99 0 0)) - Ratio 5.1:1 ✓
- Warning Amber (light mode): Dark text (oklch(0.15 0.01 260)) - Ratio 7.3:1 ✓

## Font Selection

Typography should communicate corporate professionalism with excellent readability for financial data and numbers.

- **Primary Font**: Inter (Google Fonts) - Modern, professional sans-serif with excellent readability at all sizes, designed specifically for UI
- **Monospace Font**: JetBrains Mono (Google Fonts) - Technical, clear monospace font for numbers, amounts, and data

**Typographic Hierarchy**:
- H1 (App Title): Inter Bold/32-36px/tight letter spacing - Strong brand presence
- H2 (Section Headers): Inter Bold/24px/normal spacing - Clear section delineation
- H3 (Card Headers): Inter Semibold/18px/normal spacing - Content organization
- Body Text: Inter Regular/14-16px/1.5 line height - Primary content
- Small Text (Labels): Inter Medium/12-13px/uppercase tracking - Metadata and labels
- Numbers (Amounts, Stats): JetBrains Mono Bold/various sizes/tabular nums - Financial data
- Button Text: Inter Semibold/14px - Clear CTAs

- **Primary Typeface**: IBM Plex Sans - Modern, professional, excellent for numbers and data display
- **Monospace Numbers**: JetBrains Mono - For amounts and NIP display to ensure proper alignment

- **Typographic Hierarchy**:
  - H1 (Company Header): IBM Plex Sans SemiBold/32px/tight tracking
  - H2 (Section Headers - Outstanding/Paid): IBM Plex Sans Medium/24px/normal tracking
  - H3 (Company Names): IBM Plex Sans Medium/18px/normal tracking
  - Body (General text): IBM Plex Sans Regular/15px/relaxed leading
  - Data (Amounts, NIP, Dates): JetBrains Mono Medium/14px/tabular numbers
  - Small (Metadata): IBM Plex Sans Regular/13px/muted color

## Animations

Animations should reinforce actions and guide attention without slowing down the workflow - this is a productivity tool that needs to feel responsive.

- **Invoice Movement**: Smooth slide transition when invoice moves from Outstanding to Paid (300ms ease-out)
- **Confirmation Dialogs**: Gentle scale-in animation (200ms) to draw focus without jarring
- **Score Updates**: Brief highlight pulse when points change to confirm the action registered
- **List Updates**: Subtle fade-in for new items, slide-out for completed items
- **Hover States**: Quick color transitions (150ms) on interactive elements
- **Status Badges**: Gentle glow effect on overdue items to draw attention
- **Notification Banners**: Smooth slide-down animation when notifications appear/update
- **Live Time Display**: Smooth number transitions for time updates
- **Edit Button**: Fade-in on paid invoice cards to indicate editability
- **Theme Toggle**: Smooth color transitions (300ms) across all elements when switching between light/dark modes
- **Button Hover**: Subtle scale (1.05) and shadow increase on primary actions
- **Icon Transitions**: Smooth rotation/fade when theme toggle icon changes (moon ↔ sun)

## Component Selection

- **Components**:
  - **Dialog**: For invoice entry form, invoice editing form, and company history details with multi-stage confirmation modals
  - **Card**: For individual invoice display in both Outstanding and Paid sections
  - **Badge**: For payment status indicators (Paid, Overdue, On-Time, Late) and image attachment counts
  - **Button**: Primary for actions (Add Invoice, Confirm, Save), Secondary for cancellations, Outline for Edit
  - **Input**: Text fields for company name, NIP entry, phone number, amounts, dates
  - **Form**: Structured form with validation using react-hook-form
  - **Table**: For detailed payment history in company detail view
  - **Separator**: Visual dividers between Outstanding and Paid sections
  - **Alert Dialog**: Three-stage payment confirmation system
  - **Alert**: Notification banners for upcoming/overdue payment warnings
  - **Tabs**: Organize Outstanding vs Paid invoice views
  - **Progress**: Visual indicator for multi-stage confirmation process
  
- **Customizations**:
  - Custom invoice card with expandable details section and edit button for paid invoices
  - Custom scoring badge with color gradients based on score level
  - Custom NIP input with format validation and auto-formatting
  - Custom phone input with Polish format validation (9 digits) and auto-formatting
  - Custom amount input with Polish currency formatting (spaces, comma for decimals)
  - Custom company search/filter component with real-time results
  - Custom notification banner component with severity levels (overdue vs upcoming)
  - Custom time display with Polish locale formatting
  - Image upload preview with removal functionality
  
- **States**:
  - Buttons: Default with strong affordance, hover with slight elevation, active pressed state, disabled grayed out
  - Invoice Cards: Default neutral, hover with subtle border glow, selected with accent border, overdue with red tint
  - Inputs: Default with clear border, focused with primary ring, error with red border and message, valid with green check
  - Confirmation Dialogs: Progress indicator showing step 1/3, 2/3, 3/3
  
- **Icon Selection**:
  - Plus (Add invoice, Add fuel)
  - PencilSimple (Edit invoice)
  - CheckCircle (Mark as paid, confirmation)
  - Clock (Deadline indicators, upcoming payments)
  - Bell (Notification alerts)
  - Phone (Contact information)
  - TrendUp/TrendDown (Score changes, profit/loss indicators)
  - Calendar (Date selection)
  - MagnifyingGlass (Search)
  - Buildings (Company)
  - Image (Invoice attachments)
  - Package (Cargo attachments)
  - Warning (Overdue alerts)
  - X (Remove images)
  - GasPump (Fuel entries)
  - MapPin (Location markers)
  - NavigationArrow (Distance/route indicator)
  - Wallet (Outstanding payments)
  - CurrencyCircleDollar (Financial balance)
  - ChartLine (Financial summary, analytics)
  - Trash (Delete fuel entries)
  - Download (Export functionality)
  - FilePdf (PDF export option)
  - FileCsv (CSV export option)
  - FileText (Full report generation)
  - Scales (Balance/Analytics tab)
  - Target (Break-even goals)
  - ChartBar (Charts and graphs)
  - Moon (Dark mode indicator)
  - Sun (Light mode indicator)
  
- **Spacing**:
  - Page padding: p-6 (24px)
  - Section gaps: gap-8 (32px)
  - Card padding: p-4 (16px)
  - Form field spacing: gap-4 (16px)
  - Tight groupings: gap-2 (8px)
  - Large separations: gap-12 (48px)
  
- **Mobile**:
  - Stack Outstanding, Paid, Fuel, and Balance sections vertically on mobile
  - Full-width cards on small screens
  - Bottom sheet dialogs instead of centered modals
  - Larger touch targets (min 44px) for all interactive elements
  - Simplified table view with expandable rows for history
  - Fixed header with company name and add button
  - Financial summary cards stack vertically on mobile
  - Four-column tab layout collapses to scrollable tabs on narrow screens
  - Charts resize responsively, maintain readability on small screens
  - Report generator dialog adapts to mobile viewport
  - Balance dashboard stacks charts vertically on mobile

## New Features - Vehicle & Activity Monitoring

### Vehicle Management System
- **Functionality**: Add and manage company vehicles with comprehensive details including brand, model, year, color, engine type, expected fuel consumption, initial odometer reading, and driver information (name and phone number)
- **Purpose**: Track individual vehicles and their associated fuel consumption patterns across the fleet
- **Trigger**: User clicks "Add Vehicle" button in the Fuel tab
- **Progression**: Click Add Vehicle → Enter vehicle details (brand, model, year) → Enter technical specs (color, engine, expected consumption) → Enter odometer reading → Enter driver information → Submit → Vehicle saved and available for fuel entries
- **Success criteria**: Vehicle saved with all data, appears in dropdown when adding fuel entries, driver information accessible

### Advanced Fuel Tracking with Odometer
- **Functionality**: Record fuel entries with vehicle selection, odometer reading, date, amount, and liters - automatically calculates actual fuel consumption between fill-ups
- **Purpose**: Monitor real fuel consumption vs expected consumption per vehicle, identify efficiency issues, track driver performance
- **Trigger**: User clicks "Add Fuel" in Fuel tab (requires at least one vehicle)
- **Progression**: Select Vehicle → Enter date and odometer reading → Enter amount and liters → System calculates consumption if previous entry exists → Display price per liter and consumption → Submit → Entry saved with calculated metrics
- **Success criteria**: Fuel entry saved with odometer reading, consumption automatically calculated (L/100km) based on distance since last fill-up for same vehicle, consumption displayed prominently on fuel card

### Fuel Consumption Analytics
- **Functionality**: Display calculated fuel consumption on each fuel card showing actual L/100km and distance traveled since last fill-up
- **Purpose**: Provide instant visibility into vehicle efficiency, compare actual vs expected consumption, identify trends
- **Trigger**: Automatic calculation when adding fuel with existing previous entry for same vehicle
- **Progression**: Add Fuel → System finds previous entry for same vehicle → Calculates distance (current odometer - previous odometer) → Calculates consumption ((previous liters / distance) * 100) → Displays on card with distance traveled
- **Success criteria**: Consumption shown in L/100km format, distance displayed in km, comparison to expected consumption visible (from vehicle profile)

### Activity Monitoring & Email Reporting
- **Functionality**: Automatically monitor all user actions during application session and send detailed HTML email report to gadowskispzoo@gmail.com when application closes
- **Purpose**: Maintain complete audit trail of all operations, provide management oversight, track system usage patterns
- **Trigger**: Application starts (monitoring begins) and application closes (report sent)
- **Progression**: App opens → Monitoring session starts → All actions logged (invoice add/edit/pay, fuel add/delete, vehicle add/edit) → User closes app → System generates HTML report → Email sent with activity summary, operation counts, and detailed log
- **Success criteria**: All operations logged with timestamps, email sent successfully on session end, report includes session duration, operation counts by category, and chronological detail list

### Test Email on First Launch
- **Functionality**: Send confirmation test email on first application launch to verify monitoring system
- **Purpose**: Confirm email reporting system is working correctly
- **Trigger**: First time application loads (checked via localStorage)
- **Progression**: App loads first time → Check localStorage for test email flag → If not sent, generate test email → Send to gadowskispzoo@gmail.com → Set flag → Display toast notification
- **Success criteria**: Test email sent once on first launch, includes system confirmation message, toast notification confirms send, subsequent launches skip test email

### Activity Log Structure
Each logged activity includes:
- Unique activity ID
- Activity type (invoice_added, invoice_edited, invoice_paid, fuel_added, fuel_deleted, vehicle_added, etc.)
- Human-readable description in Polish
- ISO timestamp
- Detailed metadata (IDs, amounts, names, relevant metrics)

### Email Report Format
HTML email includes:
- Professional header with company branding (Gadowski sp. z o.o.)
- Session summary (start time, end time, duration in minutes, total operations)
- Operation count statistics (invoices, fuel, vehicles, reports)
- Chronological activity log with icons and formatted timestamps
- Professional footer with auto-generation notice

## Updated Component Selection for New Features

- **Vehicle Dialog**: Shadcn Dialog component with comprehensive form, Input fields for all vehicle details, proper validation
- **Enhanced Fuel Dialog**: Shadcn Select component for vehicle selection, additional Input field for odometer reading, disabled state when no vehicles exist, helpful message prompting vehicle creation
- **Fuel Card Enhancement**: Display vehicle information (brand/model), show odometer reading with gauge icon, prominent consumption display with path icon when available, distance traveled badge
- **Activity Monitoring**: Custom React hook (useActivityMonitor) with useEffect for session management, useKV for persistent activity log storage, window.spark.llm API for email sending
- **Toast Notifications**: Sonner toast for user feedback on all operations, special toast on test email send with extended duration (5 seconds)
