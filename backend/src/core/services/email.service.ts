import { Resend } from "resend";

const resend =
  new Resend(
    process.env.RESEND_API_KEY
  );

const escapeHtml = (
  value: string
) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const sendSiteInvitationEmail = async ({
  to,
  siteName,
  role,
  token
}: {
  to: string;
  siteName: string;
  role: string;
  token: string;
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const inviteUrl =
    `${frontendUrl}/invitations/accept?token=${token}`;

  const realEmailTo =
    process.env.DEMO_INVITE_RECIPIENT ||
    to;

  const safeSiteName =
    escapeHtml(siteName);

  const safeRole =
    escapeHtml(role);

  const safeOriginalTo =
    escapeHtml(to);

  const { data, error } =
    await resend.emails.send({
      from: "CraftWeb <onboarding@resend.dev>",
      to: [realEmailTo],
      subject: `Invitation à rejoindre ${siteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Invitation CraftWeb</h2>

          <p>
            Vous avez été invité(e) à rejoindre le site
            <strong>${safeSiteName}</strong>
            avec le rôle
            <strong>${safeRole}</strong>.
          </p>

          <p style="color:#666">
            Mode démo: invitation originale pour
            <strong>${safeOriginalTo}</strong>.
          </p>

          <p>
            <a href="${inviteUrl}">
              Accepter l'invitation
            </a>
          </p>
        </div>
      `
    });

  if (error) {
    console.error("RESEND_EMAIL_ERROR", error);

    throw new Error(
      error.message ||
      "Failed to send invitation email"
    );
  }

  console.log("RESEND_EMAIL_SENT", {
    originalTo: to,
    deliveredTo: realEmailTo
  });

  return data;
};