# Healthcare Management System

## 1. Introduction and Objectives

This document defines the test strategy for a Healthcare Management System (HMS) used by hospitals and clinics. The system manages patient records, appointments, and billing, and integrates with laboratory and pharmacy modules. It is accessed by doctors, nurses, and administrative staff, supports concurrent users, connects to medical devices and external systems, and must meet healthcare data protection rules such as HIPAA.

The strategy follows the V-Model so that each build phase has a matching test level, and testing begins with static review of requirements rather than only after code is delivered. Because the system handles clinical data that affects patient care, correctness and data protection carry more weight than cosmetic defects.

Objectives of testing:

- Confirm that each functional requirement (patient records, appointments, billing, lab orders, pharmacy dispensing) works as specified and is traceable back to a requirement.
- Confirm that patient data stays accurate and consistent as it moves between the record, appointment, billing, lab, and pharmacy modules.
- Confirm that access to data is controlled by user role and that protected health information is not exposed to unauthorised users.
- Confirm the system stays responsive and stable under the expected number of concurrent users.
- Confirm integrations with lab systems, pharmacy systems, and medical devices exchange data correctly and handle failure without corrupting records.
- Produce evidence (traceability, defect records, coverage) that the system is fit to release.

## 2. Scope and Approach

### In scope

- Patient records module: registration, search, view, update, medical history.
- Appointment module: booking, rescheduling, cancellation, calendar per doctor and clinic.
- Billing module: charge capture, invoice generation, insurance claim fields, payment status.
- Laboratory integration: order placement, result return, result attachment to patient record.
- Pharmacy integration: prescription creation, dispensing, stock deduction.
- Role-based access for doctors, nurses, and administrative staff.
- Non-functional behaviour: security and data protection, performance under concurrent load, usability per role, reliability of integrations.

### Out of scope

- Internal firmware of connected medical devices (only the data exchange with the HMS is tested).
- Third-party lab or pharmacy systems' internal logic (only the interface and returned data are tested).
- Hardware provisioning and network infrastructure owned by the hospital.

### Approach

Testing moves through levels in line with the V-Model:

1. **Static testing.** Review requirements and design documents before execution to catch missing, ambiguous, or conflicting rules early. This is the cheapest point to find defects and is applied to the specification, the access-control matrix, and the integration message formats.
2. **Unit testing.** Owned by developers, covering individual functions such as billing calculations and date handling. Reviewed for coverage, not re-executed by the QA team.
3. **Integration testing.** Verify data passing between modules (record to billing, order to lab, prescription to pharmacy) and to external systems and devices.
4. **System testing.** Test the full application against the functional and non-functional requirements, including security, performance, and usability.
5. **User acceptance testing (UAT).** Clinical and administrative users confirm the system supports their real workflows before release.

Both functional and non-functional testing are used. Test design uses recognised techniques rather than ad-hoc cases:

- **Equivalence partitioning and boundary value analysis** for numeric and range fields, for example patient age, dosage quantity, billing amounts, and appointment dates around limits (minimum, maximum, one below and one above).
- **Decision table testing** for rules with several conditions, for example whether a prescription can be dispensed based on stock level, prescription validity, and patient allergy flags.
- **State transition testing** for objects that move through defined states, for example an appointment (booked, confirmed, cancelled, completed, no-show) or a lab order (ordered, in progress, resulted, verified).
- **Use case testing** for end-to-end role workflows, for example a doctor ordering a test and reviewing the result.

### Entry and exit criteria

**Entry criteria for system testing:** requirements are approved, the build is deployed to the test environment, unit and integration testing are complete, and test data is loaded.

**Exit criteria for release (measurable):**

- 100% of planned test cases executed.
- Pass rate of at least 95% on planned test cases.
- Zero open critical defects and zero open high severity defects. Medium and low defects either fixed or formally deferred with justification and sign-off.
- 100% requirements coverage in the traceability matrix (every requirement mapped to at least one executed test case).
- All performance targets in section 3 met.
- All security checks in section 3 passed with no open critical or high finding.
- UAT signed off by the clinical and administrative user representatives.

## 3. Types of Testing

### Functional testing

- **Patient records:** create, search, update, and view records; confirm history and results appear correctly; confirm validation on required fields.
- **Appointments:** book, reschedule, cancel; confirm no double booking of the same doctor and slot; confirm state changes.
- **Billing:** charge capture, invoice totals, tax and discount calculation, insurance fields, payment status updates. Boundary value analysis on amounts and quantities.
- **Laboratory:** place an order, confirm it reaches the lab interface, confirm the returned result attaches to the correct patient and order.
- **Pharmacy:** create a prescription, dispense, confirm stock reduces, confirm allergy and interaction warnings fire using a decision table.
- **Positive and negative testing:** valid inputs produce the expected result; invalid inputs (wrong data type, out-of-range values, missing mandatory fields, malformed device messages) are rejected with a clear message and no data corruption.

### Non-functional testing

- **Security and data protection testing.** Specific checks, each with a pass condition:
  - **Role-based access:** for every role (doctor, nurse, administrative staff), confirm access to permitted data and denial of the rest, using a documented role-permission matrix. Pass: zero cases where a role reaches data outside its matrix.
  - **Encryption:** confirm TLS 1.2 or higher in transit and encryption at rest for the patient database. Pass: no unencrypted channel or store holding patient data.
  - **Audit logging:** confirm every read and write to a patient record is logged with user, timestamp, and action. Pass: 100% of a sample of test transactions appear in the audit log.
  - **Session handling:** confirm session timeout after the configured idle period and that a timed-out session cannot be reused.
  - **Injection and access-control weaknesses:** run scans and manual checks against the OWASP Top 10, focusing on injection, broken access control, and authentication. Pass: zero open critical or high findings at release.
- **Data integrity testing.** Verify a change in one module is reflected correctly in linked modules and that no partial or orphaned records are created when an operation fails midway.
- **Performance testing.** Targets below are the baseline for this system and are to be confirmed with the hospital before execution; they exist so pass or fail is objective rather than a judgement call.
  - **Load test** at 500 concurrent users (the assumed peak for a mid-size hospital across clinical and administrative use). Pass condition: 95th percentile page response time at or under 3 seconds, patient record search at or under 2 seconds, and error rate under 1%.
  - **Stress test** by raising load until failure to find the breaking point and confirm it sits above 500 concurrent users with margin; confirm the system degrades gracefully (queues or rejects cleanly) rather than corrupting data or crashing.
  - **Soak test** at expected load for 8 hours (a full working day). Pass condition: no memory growth trend, no rise in response time over the run, and no increase in error rate.
  - **Integration response:** lab result return and pharmacy stock update reflected in the patient record within 5 seconds of the source event.
- **Usability testing.** Confirm each role (doctor, nurse, administrative staff) can complete its core tasks with a reasonable number of steps and clear labels, since errors in a clinical interface can affect patient safety.
- **Compatibility testing.** Confirm the application works on the browsers, operating systems, and devices the hospital actually uses.
- **Reliability and recovery testing.** Confirm the system recovers without data loss after an interruption to an integration or a service restart.
- **Compliance testing.** Confirm handling of protected health information, access control, and audit trails meet the stated regulatory requirements.

> **Note for a Rwanda deployment.** HIPAA is a United States law and has no force in Rwanda. If the system is deployed in Rwanda, the governing framework is Law n°058/2021 of 13/10/2021 relating to the protection of personal data and privacy, supervised by the National Cyber Security Authority (NCSA) and the Data Protection Office. Patient records count as sensitive personal data, so compliance testing should additionally verify: explicit consent or a lawful basis for processing sensitive data; personal data stored inside Rwanda unless a valid transfer certificate exists (this affects hosting and the test environment); a breach notification path that meets the 48-hour requirement (processor to controller, controller to NCSA and to the affected person); a record of processing activities; and a data protection impact assessment, since a hospital system is high-risk processing.

## 4. Test Environment

A dedicated test environment is required that mirrors production configuration but never uses real patient data.

- **Application and database servers** matching production versions and settings.
- **Test data:** de-identified or synthetic patient, appointment, billing, lab, and pharmacy records. Real protected health information must not be copied into the test environment.
- **Integration endpoints:** test or stub interfaces for the laboratory system, pharmacy system, and medical devices, so integration paths can be exercised without touching live external systems.
- **Role accounts:** test accounts for doctor, nurse, and administrative roles to verify access control.
- **Environments:** a functional test environment; a separate performance environment sized close to production so load results are meaningful; a UAT environment for clinical and administrative users.
- **Access control on the environment itself,** since even synthetic data should sit behind the same controls being tested.

## 5. Risk Analysis and Mitigation

Testing is prioritised by risk, so the areas where a failure causes the most harm receive the most effort.

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Incorrect or mismatched patient data across modules | High (wrong treatment or billing) | Medium | Data integrity testing across modules; traceability of every record-linked field; run integration tests early |
| Unauthorised access to patient data | High (regulatory and patient harm) | Medium | Security and role-based access testing; audit log verification; encryption checks |
| System slow or unavailable under concurrent clinical use | High (care delivery blocked) | Medium | Load, stress, and soak testing on a production-sized environment; define response-time thresholds |
| Integration failure with lab, pharmacy, or device | High (missing results, wrong dispensing) | Medium | Integration and negative testing with stubs; verify failure handling does not corrupt records |
| Billing calculation errors | Medium (financial and trust impact) | Medium | Boundary value analysis and decision tables on billing rules |
| Requirements incomplete or ambiguous | High (wrong system built) | Medium | Static review of requirements before execution; maintain traceability matrix |
| Real patient data used in testing | High (compliance breach) | Low | Enforce synthetic or de-identified data only; access control on the test environment |

Severity and priority are separated during defect handling: severity reflects the technical impact, priority reflects how urgently it must be fixed relative to the release. A data-exposure or wrong-result defect is treated as both high severity and high priority.

## 6. Tools

These are the committed tool choices for this project, each with the reason it was selected over alternatives. Selection criteria: fit for a regulated healthcare context, one integrated toolchain rather than scattered tools, team skill match, and cost. A team that has standardised on a different stack should substitute like for like, but the choice should be made and recorded, not left open.

| Purpose | Tool | Reason for this choice |
|---------|------|------------------------|
| Test management, traceability, defect tracking | Jira with the Xray test management app | Keeps test cases, execution runs, the traceability matrix, and defects in one place with native links, so coverage and defect status are always consistent. Chosen over separate TestLink plus Bugzilla to avoid manual reconciliation between tools. |
| Functional and regression UI automation | Selenium WebDriver 4 with Java and TestNG | Open source, no licence cost, works across the browsers the hospital uses, and matches the team's existing Java skills. Chosen over Cypress because cross-browser and legacy-browser support matters in a hospital estate. |
| API and integration testing | Postman with Newman for command-line runs in the pipeline | Directly exercises the lab, pharmacy, and device interfaces without the UI; Newman lets the same collections run automatically in CI. |
| Performance testing | Apache JMeter 5.6 | Handles the 500-user load, stress, and 8-hour soak profiles; open source; produces the percentile and error-rate reports the exit criteria need. |
| Security testing | OWASP ZAP for scanning, plus manual role-based access checks | Covers the OWASP Top 10 checks named in section 3; open source; the manual checks catch access-control gaps a scanner misses. |
| Data integrity checking | Direct SQL queries against the test database | Confirms cross-module data (record to billing to lab to pharmacy) is consistent at the data layer, not only in the UI. |
| CI integration | Jenkins running the automated API, regression, and performance suites on each build | Gives repeatable execution and early feedback rather than manual test runs. |

Automation covers stable, repeated regression paths, the API and integration suites, and the performance runs. Exploratory testing, usability testing, and first-pass testing of new features stay manual.

## 7. Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| Test Lead / QA Manager | Owns this strategy, plans and estimates the effort, assigns work, reports status and risk, decides on release readiness against exit criteria |
| Senior QA Engineer | Designs test cases using the stated techniques, builds and maintains traceability, reviews others' cases |
| QA Engineers / Testers | Execute test cases, log defects, retest fixes, run regression |
| Automation Engineer | Builds and maintains automated functional, API, and regression scripts |
| Performance Tester | Designs and runs load, stress, and soak tests; reports results against thresholds |
| Security Tester | Runs access-control, encryption, audit, and vulnerability checks |
| Developers | Unit testing, fixing defects, supporting integration testing |
| Business / Clinical Users | Take part in UAT, confirm workflows match real practice, sign off |
| Business Analyst | Clarifies requirements, supports static review, confirms expected behaviour |

## 8. Test Estimation

Estimation uses test-case enumeration combined with fixed productivity rates, so every effort number can be traced back to a count and a rate rather than being asserted. The method has four steps, each shown with its working. The requirement counts and rates below are the planning baseline; when the final requirement count differs, the same rates recalculate the effort automatically.

### Step 1: Size the functional work by complexity

Each requirement is classified simple, medium, or complex, and each class carries a fixed number of test cases (positive, negative, and technique-driven). This turns a requirement count into a test-case count.

Test cases per requirement by complexity: simple = 3, medium = 6, complex = 10.

| Module | Simple reqs | Medium reqs | Complex reqs | Test cases |
|--------|-------------|-------------|--------------|-----------|
| Patient records | 3 | 6 | 3 | 9 + 36 + 30 = 75 |
| Appointments | 2 | 6 | 2 | 6 + 36 + 20 = 62 |
| Billing | 2 | 4 | 4 | 6 + 24 + 40 = 70 |
| Lab integration | 1 | 4 | 3 | 3 + 24 + 30 = 57 |
| Pharmacy integration | 1 | 4 | 3 | 3 + 24 + 30 = 57 |
| Access control / security | 1 | 3 | 4 | 3 + 18 + 40 = 61 |
| **Functional total** | | | | **382 test cases** |

### Step 2: Convert test cases to effort with productivity rates

Fixed rates per tester per day (based on typical manual test-case throughput; replace with your own historical figures if you have them):

- Design: 8 test cases designed per day.
- Execution: 20 test cases executed per day, per full pass.
- Number of execution passes planned: 2 (first pass plus one full regression pass), plus a retest allowance of 30% of one pass for failed-case reruns.

Effort in person-days for the 382 functional test cases:

- Design: 382 / 8 = 48 days.
- Execution, pass 1: 382 / 20 = 19 days.
- Execution, regression pass: 382 / 20 = 19 days.
- Retest of failures: 19 × 0.30 = 6 days.
- Functional subtotal: 48 + 19 + 19 + 6 = **92 person-days**.

### Step 3: Estimate non-functional work separately

Non-functional testing is setup-heavy and does not scale off the test-case count, so it is estimated as fixed blocks of work.

| Activity | Person-days | Basis |
|----------|-------------|-------|
| Performance (build scripts, environment, run load/stress/soak, analyse) | 12 | Script build 5, runs and reruns 4, analysis and report 3 |
| Security (ZAP setup and scans, manual role-matrix checks, report) | 10 | Scan setup and runs 4, manual access checks 4, report 2 |
| Usability (3 roles, sessions and findings) | 5 | Roughly 1.5 days per role |
| Data integrity (SQL checks across modules) | 4 | |
| **Non-functional subtotal** | **31 person-days** | |

### Step 4: Total, contingency, staffing, and schedule

| Component | Person-days |
|-----------|-------------|
| Functional (Step 2) | 92 |
| Non-functional (Step 3) | 31 |
| Test planning, strategy, and traceability setup | 8 |
| Subtotal | 131 |
| Contingency at 15% (defect churn, clarifications, environment downtime) | 20 |
| **Total estimated effort** | **151 person-days** |

Staffing and duration: with 4 test engineers available and an assumed 85% effective working day (the rest lost to meetings, triage, and admin), daily capacity is 4 × 0.85 = 3.4 productive person-days per calendar day. Duration = 151 / 3.4 = about 45 working days, or roughly 9 working weeks, for the test execution phase. This excludes UAT, which is run by business users on a separate schedule.

Assumptions this estimate depends on, to be confirmed before commit: the requirement counts and complexity mix in Step 1; a stable test environment available for the full window; developer turnaround on defect fixes within the same sprint; and no more than one major requirement change during execution. If any breaks, the estimate is re-run with the same rates.

## 9. Defect Management Process

Defects follow a defined life cycle so nothing is lost and status is always clear:

New → Assigned → Open (in fix) → Fixed → Retest → Closed. A defect that fails retest is Reopened. A defect judged not valid is marked Rejected; one that is valid but not fixed now is Deferred with justification.

Each defect record contains: a unique ID, title, module, steps to reproduce, expected and actual result, environment, severity, priority, and evidence (screenshot, log, or data reference).

Severity and priority are recorded separately:

- **Critical severity:** patient data loss or corruption, wrong clinical result, data exposure, or system down. Fixed before release.
- **High severity:** a core workflow (booking, billing, dispensing) blocked with no reasonable workaround.
- **Medium severity:** function works incorrectly but a workaround exists.
- **Low severity:** cosmetic or minor wording issues.

Priority (high, medium, low) is set by how soon the fix is needed relative to the release, which can differ from severity. Defect metrics tracked include defect density per module and open defects by severity, used to judge readiness against the exit criteria.

## 10. Test Deliverables

Deliverables produced across the test cycle:

**Before execution:**
- This test strategy document.
- Test plan (schedule, resources, environment details).
- Test cases and test scripts.
- Requirements traceability matrix linking each requirement to its test cases.
- Test data specification (synthetic and de-identified).

**During execution:**
- Test execution logs and status reports.
- Defect reports and the defect log.

**After execution:**
- Test summary report (what was tested, results, coverage, open defects).
- Updated traceability matrix showing coverage.
- Performance and security test result reports.
- Release readiness recommendation against the exit criteria.
- UAT sign-off record.
