---
name: clinic-hospital-management
description: "Use when designing, building, or improving a complete clinic and hospital management system covering patient registration, appointments, EMR, triage, billing, pharmacy, lab diagnostics, inpatient ward management, telehealth, staff operations, analytics, compliance, and operational administration."
---

# Clinic & Hospital Management System Skill

## Goal
Create a best-in-class clinic and hospital management software that covers the complete patient journey, clinical operations, financial workflows, staff administration, and compliance requirements while remaining fast, role-aware, and operationally clear.

## Core Principle
Design for the reality of healthcare operations: patients, doctors, nurses, billing staff, pharmacists, lab personnel, administrators, and compliance teams all work from the same healthcare data, but each role needs tailored workflows and permissions.

## Required Features

### 1. Patient and Registration Management
- Patient registration and demographic capture
- Unique patient identifier and medical record numbering
- Duplicate record checks and merge suggestions
- Patient lookup and search by ID, name, phone, doctor, or diagnosis
- New patient onboarding and edit workflows
- Patient enquiry desk and front-desk queue management
- Reception token tracking and service workflows

### 2. Appointment and Scheduling Management
- Doctor appointment scheduling
- Department-based clinic calendars
- Time-slot booking and availability tracking
- Follow-up and recurring appointments
- Appointment status handling: scheduled, checked in, in consultation, completed, cancelled
- Follow-up reminders and rescheduling workflows
- Telehealth consult booking and virtual visit routing

### 3. Clinical Assessment and Triage
- Triage intake and urgency scoring
- Nurse assessment forms with pain scale, vitals, allergies, and notes
- Emergency versus routine priority routing
- Clinical notes and observation capture
- Alerts for high-risk patients and escalation triggers

### 4. Electronic Medical Records (EMR)
- Longitudinal patient history and visit timeline
- Diagnosis and treatment notes
- Prescriptions and medication records
- Lab and imaging results integration
- Allergy and medical history tracking
- Clinical documentation for doctors and nurses
- Patient chart summary and encounter history

### 5. Inpatient and Ward Management
- Ward occupancy dashboard
- Bed allocation and status management
- Room and bed assignment by department/unit
- Inpatient status tracking
- Discharge planning support
- Nurse rounding and ward utilization analytics

### 6. Pharmacy and Inventory Management
- Medicine inventory tracking
- Stock levels, batch tracking, and expiry monitoring
- Prescription validation and dispensing workflows
- Reorder alerts and purchase planning
- Pharmacy sales and medication ledger
- Drug safety checks and contraindication review

### 7. Laboratory and Diagnostic Operations
- Lab test ordering and tracking
- Sample collection status and processing
- Diagnostic result entry and review
- Radiology request and scan tracking
- Report generation and distribution to physicians
- Result comparison across visits and disease monitoring

### 8. Billing, Invoicing, and Payments
- Consultation and service charge capture
- Insurance authorisation and claim processing
- Partial payment, advance payment, and refund workflows
- Invoice generation and reprint support
- Payment collection by cash, card, bank transfer, or insurance
- Outstanding balance tracking and payment summaries
- Unified financial reconciliation and sales reporting

### 9. Pricing and Hospital Catalogs
- Master price list for procedures and services
- Department-wise pricing and service catalog
- Insurance coverage estimation and plan validation
- Service package pricing
- Tariff management and price updates

### 10. Telehealth and Virtual Care
- Online consultation scheduling
- Video call initiation from patient or doctor workflow
- Virtual clinical notes and consultation summaries
- Telehealth status tracking and doctor assignment
- Remote follow-up and patient counselling support

### 11. Staff, Roles, and Workforce Management
- Staff directory and profiles
- Department assignments and role permissions
- Doctor duty rosters and schedules
- Shift management and on-call coverage
- Staff task assignment and operational visibility
- Role-based access control for clinicians, nurses, billing, lab, and admin

### 12. Analytics, Reports, and Business Intelligence
- Daily, monthly, and yearly sales reporting
- Doctor performance analytics
- Patient volume and department trend analysis
- Token flow and queue performance reports
- Diagnostic and billing summaries
- Financial performance dashboards
- Operational KPI tracking for occupancy, throughput, and utilization

### 13. Compliance, Governance, and Administration
- Audit logs and system activity tracking
- Role-based access rules and permissions
- Data retention and backup reminders
- Security policies and governance controls
- Regulatory compliance checks such as HIPAA-style privacy and clinical record safeguards
- System health alerts and operational oversight

### 14. Support Features for a Modern Health Platform
- Department portal selection and role-aware navigation
- Command palette and keyboard shortcuts for operational speed
- Theme selection and user personalization
- Backup reminders and reminder workflows
- Notification and alert panels
- Usability features for high-speed clinical operation

## Workflow to Follow

### Step 1: Define the operational model
Start by identifying:
- Hospital or clinic type: multi-specialty hospital, primary clinic, specialty center, or mixed model
- User roles: administrator, doctor, nurse, pharmacist, lab technologist, billing clerk, registrar, radiologist
- Operational flows: registration, consultation, treatment, discharge, billing, reporting
- Standards: clinical safety, privacy, and auditability

### Step 2: Model the patient journey
Build a patient-first data model that supports:
- registration
- triage
- diagnosis
- investigation requests
- treatment plans
- admissions and discharge
- follow-up and billing

### Step 3: Build core modules in priority order
Implement core workflows in this order:
1. Patient registration and enquiry
2. Appointment scheduling
3. Triage and clinical intake
4. EMR and doctor notes
5. Billing and payments
6. Pharmacy, labs, and diagnostics
7. Wards and inpatient operations
8. Telehealth and remote care
9. Staff and operational oversight
10. Reports and compliance

### Step 4: Add role-based permissions
Every feature must respect user roles:
- Front desk can register patients and manage appointments
- Doctors can view and update EMR and prescriptions
- Nurses can triage and monitor ward care
- Pharmacists can manage inventory and dispensing
- Lab staff can add test results
- Billing staff can handle invoices and insurance claims
- Administrators can review governance and reports

### Step 5: Ensure financial and clinical integrity
Check for:
- duplicate patient records
- missing insurance authorisation
- invalid billing totals
- improper access to private records
- incomplete diagnosis/lab result flows
- inventory mismatch between stock and dispensations

### Step 6: Provide operational dashboards and KPI visibility
Include real-time or near-real-time views for:
- patient flow
- doctor utilization
- lab turnaround time
- unpaid invoices
- stock risk
- ward occupancy
- emergency queue status

### Step 7: Support compliance and resilience
Add:
- audit trails for clinical and financial actions
- data backup reminders
- user access controls
- privacy-aware patient records
- secure handling of sensitive health data

## Decision Points and Branching Logic

### If patient is new
- Capture registration data
- Create unique patient record
- Route to appointment or triage based on visit type

### If patient is existing
- Retrieve patient history
- Validate allergies, diagnoses, ongoing treatment, and insurance status
- Continue case management without duplication

### If consultation is outpatient
- Book doctor schedule
- Record visit notes and prescriptions
- Generate invoice or insurance claim

### If consultation requires admission
- Allocate ward bed
- Update inpatient status
- Track daily care, medications, diagnostics, and billing

### If insurance is involved
- Verify coverage and authorisation
- Apply service coverage rules
- Record insured amount and balance due

### If diagnostics are ordered
- Trigger lab or radiology workflow
- Track sample collection and result return
- Link result to EMR and billing

### If pharmacy dispensing is required
- Check stock and expiry
- Validate prescription details
- Record medication dispensed and remaining inventory

## Quality Standards and Completion Checks
Use this checklist before considering the system complete:
- Patient records are unique, searchable, and securely accessible
- Appointment and queue workflows are reliable
- Triage and clinical notes are captured accurately
- EMR supports diagnosis, treatment, and follow-up history
- Billing and insurance operations are transparent and auditable
- Pharmacy and lab workflows maintain correct inventory and results
- Ward and inpatient operations can be tracked throughout admission
- Telehealth visits integrate with patient timeline
- Staff permissions align with assigned roles
- Reports show operational and financial performance correctly
- Compliance and audit trails are in place
- Backup and governance reminders are visible and actionable

## Best-Practice Recommended Deliverables
A strong implementation should include:
- dashboard overview
- registration desk
- patient EMR module
- appointment manager
- staff scheduler
- triage station
- ward occupancy board
- pharmacy and inventory management
- lab and diagnostics workflows
- billing and payment center
- hospital price catalog
- reports and analytics
- admin compliance and governance panel
- telehealth portal and video consult capability

## Example Prompt to Use This Skill
- Build a complete hospital management system with patient registration, EMR, appointment booking, billing, telehealth, and reports.
- Add role-based workflows for doctors, nurses, pharmacy, lab, front desk, and administrators in a best-practice clinic system.
- Design an inpatient and outpatient hospital dashboard with ward tracking, prescription workflow, and payment settlement.
- Implement a modern healthcare software with patient triage, queue management, compliance, and analytics.

## Related Customizations to Create Next
- a dedicated patient-journey workflow skill
- a billing-and-insurance automation skill
- a compliance-and-audit governance skill
- a telehealth-and-virtual-care skill
- a staff-operations and scheduling skill
