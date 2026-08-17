"use client";

import PushAlertsToggle from "@/components/admin/PushAlertsToggle";

// New-mail alerts for the admin: a push notification + icon badge on this
// device whenever fetching finds new messages — even with the app closed.
// Thin wrapper over the shared device-subscription toggle (enabling it here
// also covers bookings/enquiries/follow-up alerts, since they all share one
// subscription — see PushAlertsToggle).
export default function MailAlerts() {
  return <PushAlertsToggle onLabel="Get new-mail alerts on this device" offLabel="New-mail alerts on — turn off" />;
}
