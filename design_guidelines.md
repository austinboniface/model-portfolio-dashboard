# Design Guidelines: Portfolio Model Management Platform

## Design Approach
**System Selection**: Carbon Design System principles - optimized for data-heavy enterprise applications requiring clarity, consistency, and efficient information processing.

**Core Principles**:
- Information hierarchy through typography and spatial relationships
- Dense data presentation with breathing room
- Scannable layouts optimizing for quick decision-making
- Consistent component patterns for rapid user fluency

## Typography System

**Font Stack**: IBM Plex Sans (primary), IBM Plex Mono (data/numbers)

**Hierarchy**:
- Dashboard titles: 2xl, semibold
- Section headers: xl, medium  
- Card titles: lg, medium
- Body text: base, regular
- Data labels: sm, medium
- Numerical data: base, mono, medium
- Metadata/timestamps: xs, regular

## Layout Framework

**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm

**Grid System**:
- Main dashboard: 12-column grid with 6-unit gutters
- Sidebar navigation: Fixed 64-unit width (collapsed) or 256-unit width (expanded)
- Content area: max-w-screen-2xl with responsive padding (px-6 lg:px-8)

**Dashboard Layout**:
- Top navigation bar: h-16, fixed, contains search, notifications, user profile
- Left sidebar: Collapsible navigation with icon-only or full labels
- Main content: Scrollable with sticky headers for tables/data
- Right rail (optional): 320-unit width for contextual tools/filters

## Component Architecture

### Navigation & Wayfinding
- **Primary Nav**: Vertical sidebar with Models, Research, Holdings, Analytics sections
- **Breadcrumbs**: Show hierarchical location (Dashboard > Model Name > Holdings)
- **Tabs**: Horizontal tabs for switching between Performance, Holdings, Analytics views within model details
- **Quick Actions**: Floating action button (bottom-right) for "New Model" or "Add Position"

### Data Display Components
- **Model Cards**: Grid layout (grid-cols-1 md:grid-cols-2 xl:grid-cols-3) with performance metrics, sparklines, allocation pie charts
- **Data Tables**: Sticky headers, sortable columns, row hover states, inline actions, expandable rows for drill-down
- **Performance Charts**: Line charts for returns, area charts for allocation drift, bar charts for sector comparison
- **Holdings X-Ray**: Nested tables showing fund-level and underlying holdings hierarchy
- **Comparison View**: Side-by-side panels for analyzing multiple models

### Interactive Elements
- **Filter Panels**: Collapsible left rail with date ranges, asset classes, performance thresholds
- **Search**: Global search with autocomplete for securities, models, managers
- **Modals**: For detailed prospectus views, transaction entry, bulk operations
- **Drawers**: Slide-out panels from right for security research, notes, trade blotter

### Form Elements
- **Model Builder**: Multi-step wizard with allocation sliders, security search, target weight inputs
- **Trade Entry**: Compact form with ticker lookup, quantity/weight toggles, execution notes
- **Research Filters**: Checkbox groups, range sliders, dropdown selectors for screening

### Status & Feedback
- **Performance Indicators**: Inline badges for returns (positive/negative), drift alerts, compliance flags
- **Loading States**: Skeleton screens for tables, shimmer effects for chart loading
- **Notifications**: Toast messages (top-right) for trade confirmations, data updates, alerts
- **Empty States**: Helpful prompts with actions when no models/holdings exist

## Page-Specific Layouts

### Dashboard Home
- Header: Welcome message, date selector, quick stats (AUM, model count, pending trades)
- Grid: 3-column model cards with key metrics and mini-charts
- Bottom: Recent activity feed, market snapshot widget

### Model Detail View
- Header: Model name, performance summary, primary actions (Edit, Rebalance, Compare)
- Tabs: Performance | Holdings | Analytics | History
- Performance Tab: Time-series charts, benchmark comparison, attribution
- Holdings Tab: Data table with position details, weight drift indicators, underlying exposure
- Analytics Tab: Risk metrics, factor exposures, scenario analysis

### Research Center
- Split view: Left (50%): Screening interface with filters; Right (50%): Results table
- Top bar: Saved screens dropdown, comparison basket (up to 5 securities)
- Results: Sortable table with add-to-model quick actions
- Detail panel: Drawer opens with full prospectus, holdings x-ray, performance charts

### Trade Blotter
- Full-width table with status workflow (Pending > Staged > Executed)
- Inline editing for quick modifications
- Bulk actions toolbar for multi-select operations
- Summary footer: Total value, count, execution status

## Responsive Behavior
- Desktop (lg+): Full sidebar, multi-column grids, side-by-side comparisons
- Tablet (md): Collapsed sidebar, 2-column grids, stacked comparisons
- Mobile: Hidden sidebar (hamburger menu), single-column, simplified charts

## Animation Guidelines
Use sparingly - only for meaningful transitions:
- Sidebar expand/collapse: 200ms ease
- Modal/drawer entry: 300ms ease-out
- Chart rendering: Stagger animation for data points
- NO animations on: Table sorting, filter updates, number changes