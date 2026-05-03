export const welcomeTemplate = (name: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { font-family: sans-serif; padding: 20px; color: #333; }
        .button { 
          background-color: #007bff; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome, ${name}!</h1>
      </div>
    </body>
  </html>
`;
