export const resetPasswordTemplate = (
  name: string,
  uuid: string,
  url: string,
) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      .container {
        font-family: Arial, sans-serif;
        background: #f6f7fb;
        padding: 24px;
        color: #333;
      }

      .card {
        max-width: 520px;
        margin: 0 auto;
        background: #ffffff;
        padding: 24px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      }

      h2 {
        margin-bottom: 12px;
      }

      p {
        line-height: 1.5;
        font-size: 14px;
      }

      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 18px;
        background: #e53935;
        color: #fff !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
      }

      .small {
        margin-top: 20px;
        font-size: 12px;
        color: #777;
        word-break: break-all;
      }

      .warning {
        margin-top: 16px;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="card">
        <h2>Hi, ${name}</h2>

        <p>
          We received a request to reset your password.
          If this was you, click the button below to set a new password.
        </p>

        <a
          class="button"
          href="https://${url}/auth/reset-password/${uuid}"
        >
          Reset Password
        </a>

        <p class="small">
          If the button doesn’t work, copy and paste this link:<br/>
          https://${url}/auth/reset-password/${uuid}
        </p>

        <p class="warning">
          If you didn’t request this, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </div>
    </div>
  </body>
</html>
`;
