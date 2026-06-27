import nodemailer from "nodemailer";

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

  const emailUser =
    process.env.EMAIL_USER;

  const emailPass =
    process.env.EMAIL_PASS;

  if (
    !emailUser ||
    !emailPass
  ) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is missing"
    );
  }

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const inviteUrl =
    `${frontendUrl}/invitations/accept?token=${token}`;

  const from =
    process.env.EMAIL_FROM ||
    `CraftWeb <${emailUser}>`;

  const safeSiteName =
    escapeHtml(siteName);

  const safeRole =
    escapeHtml(role);

  const transporter =
    nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

  try {

    const result =
      await transporter.sendMail({
        from,
        to,
        subject:
          `Invitation à rejoindre ${siteName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Invitation CraftWeb</h2>

            <p>
              Vous avez été invité(e) à rejoindre le site
              <strong>${safeSiteName}</strong>
              avec le rôle
              <strong>${safeRole}</strong>.
            </p>

            <p>
              Cliquez sur le bouton ci-dessous pour accepter l'invitation.
            </p>

            <p>
              <a
                href="${inviteUrl}"
                style="
                  display: inline-block;
                  padding: 12px 18px;
                  background: #00b894;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Accepter l'invitation
              </a>
            </p>

            <p style="color: #666; font-size: 13px;">
              Si vous n'êtes pas concerné(e), ignorez cet email.
            </p>
          </div>
        `
      });

    console.log(
      "GMAIL_EMAIL_SENT",
      {
        to,
        messageId:
          result.messageId
      }
    );

    return result;

  } catch (error) {

    console.error(
      "GMAIL_EMAIL_ERROR",
      error
    );

    throw new Error(
      "Failed to send invitation email"
    );
  }
};