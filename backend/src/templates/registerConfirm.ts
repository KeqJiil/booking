export const registerTemplate = (name: string, uuid: string, url: string) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      .container {
        font-family: Arial, sans-serif;
        padding: 24px;
        color: #333;
        background: #f9f9f9;
      }

      .card {
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        max-width: 520px;
        margin: 0 auto;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }

      .button {
        display: inline-block;
        margin-top: 20px;
        background-color: #007bff;
        color: #fff !important;
        padding: 12px 18px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
      }

      .muted {
        margin-top: 16px;
        font-size: 12px;
        color: #777;
        word-break: break-all;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="card">
        <h2>Hello, ${name}</h2>

        <p>Thanks for registering. Please confirm your email to activate your account.</p>

        <a 
          class="button"
          href="https://${url}/auth/verify/${uuid}"
        >
          Confirm Email
        </a>

        <p class="muted">
          If button doesn't work, copy this link:<br/>
          https://${url}/auth/verify/${uuid}
        </p>
      </div>
    </div>
  </body>
</html>
`;
