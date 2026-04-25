# Stadium Command

A live, real-time stadium operations system designed for crowd monitoring, incident reporting, triage, and field response.

## The Problem
Running a massive stadium event involves thousands of moving pieces. When a fan spills a drink, a fight breaks out, or a queue gets too long, communicating exactly *what* is happening and *where* to the right department usually relies on slow radios or confusing chains of command. Uncoordinated responses cause delays, safety risks, and poor fan experiences.

## Our Solution
Stadium Command is a unified platform that connects everyone in the venue. It allows:
*   **Attendees** to report issues instantly.
*   **Volunteers** to update crowd conditions and telemetry from the field.
*   **Command Center** operators to monitor all incidents globally.
*   **Security, Housekeeping, and Police** to receive and act on cases assigned specifically to them in real-time.

## Main Features
*   **Live Incident Routing:** Instantly route issues to the correct department.
*   **AI Triage:** Automatically summarize long reports and assess true severity.
*   **Photo Evidence:** Fans and staff can "show, not just tell" what the problem is.
*   **Multi-Role Ops:** Specialized dashboards built exactly for the needs of each role.

## Role-Based Modules
*   **Attendee:** Frictionless reporting with location tagging, image uploads, and urgency controls.
*   **Volunteer:** Practical tools for field staff to update zone statuses dynamically and estimate headcounts.
*   **Command Center:** Real-time telemetry map summarizing zone hot-spots, intelligent KPIs, and a live activity timeline.
*   **Security:** A dark-mode tactical interface for guards with lifecycle tracking (En-Route, On-Scene) and direct Police escalation.
*   **Housekeeping:** An optimized task board for cleaners to accept tasks and clear the queue easily.
*   **Police:** An isolated, high-contrast critical interface handling only extreme, escalated threats.

## AI Usage
Stadium Command uses **Gemini 2.5 Flash** as an instant triage assistant. When an attendee sends an unstructured report and a photo, Gemini analyzes it to:
*   Gauge the true severity (e.g., distinguishing a "spilled soda" from a "medical emergency").
*   Extract a concise, actionable headline.
*   Help the Command Center act faster by drastically reducing cognitive load during high-stress events.

## Tech Stack
*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
*   **Backend:** Node.js, Express (with an rapid in-memory database tailored for seamless demo experiences)
*   **AI:** Google GenAI SDK (`@google/genai`)

## Local Setup
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd stadium-command
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your environment variables (see below).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables
Create a file named `.env` in the root folder and add your Gemini API Key:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```
*(No other variables are required for the core app to run in the local demo mode).*

## How Judges Can Test This
To understand the full value of Stadium Command, we recommend testing the system from different perspectives using multiple browser tabs or windows:

1.  **Open the App & View Roles:** Open the landing page to see the different available modules.
2.  **Submit a Report (Attendee):** Open the **Attendee UI**. Report a "Security Issue" or "Spill", provide a short description, upload a photo, and click submit. You will receive a Case ID.
3.  **Update Crowd Telemetry (Volunteer):** Open the **Volunteer Ops** page. Select a zone, update the crowd density and headcount, and submit.
4.  **Monitor the Network (Command Center):** Open the **Central HQ**. Watch the KPI dashboard update automatically. You will see the new incidents appear with an AI-generated summary and severity rating.
5.  **Act on the Incident (Security/Housekeeping):** 
    *   If you reported a spill, open the **Housekeeping** module, accept the job, and mark it Cleaned.
    *   If you reported a security issue, open the **Security** module. Mark it "En Route", then "On Scene". For testing, choose "10-33: Request LEO" to escalate it to the police.
6.  **Police Escalation (Police):** Open the **LEO Escalation** module. Notice how the critical security threat has bypassed normal channels and appeared immediately on the Police dashboard with high-priority warnings.

## Demo Credentials / Notes
*   **Role Switching:** All roles are accessible from the main landing page without requiring a login or PIN. This frictionless setup allows judges to easily jump between views.
*   **In-Memory Database:** This demo uses a fast in-memory store. Data will reset when the server restarts, making it perfect for rapid testing loops.
