import { Source } from './schemas/evidence.js';

export const DEMO_SOURCES: Source[] = [
  {
    id: 'src-pdf-01',
    fileName: 'titan_fleet_audit_2025.pdf',
    type: 'pdf',
    fileSize: 245000,
    uploadedAt: '2026-10-06T08:30:00Z',
    description: 'Titan Robotics Annual Executive Audit & Fleet Operations Report (2025)',
    content: `
--- PAGE 1: EXECUTIVE OPERATIONS REVIEW ---
TITAN ROBOTICS FLEET PERFORMANCE AUDIT (FY2025)
Document ID: TR-AUD-2025-Q4 | Classification: Operational Confidential

Section 1.1: Product Launch Milestones
- The next-generation autonomous cargo drone "Falcon-X" achieved commercial launch in January 2025.
- The prior generation "Apex-9" concluded primary deployment after its initial launch in May 2024.
- Across FY2025, Falcon-X was designated as the flagship carrier across Arctic and North American logistics routes.

Section 1.2: Fleet Revenue Highlights
- Falcon-X achieved unprecedented commercial traction, achieving $20M in total FY2025 revenue ($9M in Q3, $11M in Q4).
- Apex-9 generated $12M total FY2025 revenue.
- Stratus-4 utility units yielded $8M in total revenue.

--- PAGE 2: MAINTENANCE & HARDWARE INCIDENTS ---
Section 2.1: Q4 Maintenance Expenditure Summary
- Official accounting reports state total Q4 maintenance expenditure for the Falcon-X fleet stood at $420,000 USD, representing scheduled depot refits and avionics calibration.
- Apex-9 fleet maintenance required $195,000 USD across Q4.

Section 2.2: Firmware Upgrades & Environmental Thermal Stability
- Firmware v4.2 was deployed company-wide on October 14, 2025, targeting cold-weather battery thermal management.
- Preliminary flight telemetry noted a ~14% increase in apparent battery endurance during November test runs; however, high-altitude sub-zero sorties were deliberately reduced by 40% in December due to regional blizzard warnings.
- Unit #12 experienced accelerated electrochemical cell wear after 1,450 cumulative flight cycles, but standard preventative maintenance intervals were maintained.
`,
  },
  {
    id: 'src-csv-02',
    fileName: 'drone_telemetry_financials_2025.csv',
    type: 'csv',
    fileSize: 12400,
    uploadedAt: '2026-10-06T08:31:00Z',
    description: 'Autonomous Drone Fleet Quantitative Telemetry & Accounting Ledger',
    content: `Model,Generation,Launch_Date,Q3_Revenue_M,Q4_Revenue_M,Total_Revenue_2025_M,Flight_Hours_2025,Failure_Count,Maintenance_Cost_Q4_USD
Falcon-X,Gen 3,Jan 2025,9,11,20,14200,3,485000
Apex-9,Gen 2,May 2024,5,7,12,9800,8,195000
Stratus-4,Gen 1,Nov 2023,3,5,8,5100,14,310000
Vanguard-X,Prototype,Sep 2025,1,2,3,1200,5,150000`,
  },
  {
    id: 'src-chart-03',
    fileName: 'q4_telemetry_power_curve.png',
    type: 'chart',
    fileSize: 382000,
    uploadedAt: '2026-10-06T08:32:00Z',
    description: 'Q4 Drone Telemetry Power Consumption Curves & Operational Spikes',
    content: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNTAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzBkMTEyMCIvPjxwYXRoIGQ9Ik01MCA0NTBMODAwIDQ1MCIgc3Ryb2tlPSIjM2IzYTRlIi8+PC9zdmc+',
    metadata: {
      visualPoints: [
        {
          entity: 'Falcon-X',
          label: 'Q4 Peak Power Demand',
          value: '420 kW',
          region: 'Upper right quadrant, telemetry curve peak [X: Nov 18, Y: 420kW]',
          relationships: ['Falcon-X', 'Power Efficiency'],
        },
        {
          entity: 'Apex-9',
          label: 'Q4 Peak Power Demand',
          value: '310 kW',
          region: 'Mid quadrant, baseline telemetry [X: Nov 18, Y: 310kW]',
          relationships: ['Apex-9', 'Power Efficiency'],
        },
        {
          entity: 'Falcon-X Maintenance Downtime',
          label: 'Depot Maintenance Spike',
          value: 'Scheduled depot overhaul Nov 12-15',
          region: 'Telemetry gap region [Nov 12 - Nov 15]',
          relationships: ['Maintenance', 'Depot Refit'],
        },
      ],
    },
  },
];

export const DEMO_PRESET_QUESTIONS = [
  {
    id: 'q-proven',
    label: 'PROVEN Scenario: Best Performing Unit & Flight Hours',
    question: 'Which drone model generated the highest revenue in 2025, and did its flight hours exceed the previous generation?',
    expectedStatus: 'PROVEN',
    badge: 'PROVEN',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'q-conflict',
    label: 'CONFLICT Scenario: Q4 Maintenance Expenditure Discrepancy',
    question: 'What was the total Q4 maintenance expenditure for the Falcon-X unit?',
    expectedStatus: 'UNKNOWN', // Or flagged with conflict banner
    badge: 'CONFLICT DETECTED',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'q-inferred',
    label: 'INFERRED Scenario: Firmware v4.2 Sub-Zero Efficiency',
    question: 'Did the firmware v4.2 update improve battery efficiency during sub-zero operations?',
    expectedStatus: 'INFERRED',
    badge: 'INFERRED',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  {
    id: 'q-unknown',
    label: 'UNKNOWN Scenario: Exact Minute-Level Battery Failure Timestamp',
    question: 'Exactly what time will the battery degradation reach critical failure on Falcon-X Unit #12 in November?',
    expectedStatus: 'UNKNOWN',
    badge: 'UNKNOWN + BOUNDED REASONING',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];
