import nodemailer from "nodemailer";
export default async function sendEnquiryMail(formData) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "metablock.sale3@gmail.com",
      pass: "sltv hddx nbpu tlyl",
    },
  });
  const htmlContent = contactEmailTemplate(formData);
  let mailOptions = {
    from: "metablock.sale3@gmail.com",
    to: "stargoldtelicom@gmail.com",
    subject: "Matka Enquiry From User",
    html: htmlContent,
  };
  // let mailOptions01 = {
  //   from: "metablock.sale3@gmail.com",
  //   to: "jayeshvijay649@gmail.com",
  //   subject: "Matka Enquiry From User",
  //   html: htmlContent,
  // };
  // await transporter.sendMail(mailOptions01);
  await transporter.sendMail(mailOptions);
}

export function contactEmailTemplate(formData) {
  return `
        <html>
        <head>
            <style>
                /* Add any custom styles here */
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Enquiry Received</h2>
                </div>
                <p><strong>Name:</strong> ${
                  formData.name || "Not Available"
                }</p>
                <p><strong>Country:</strong> ${
                  formData.country || "Not Available"
                }</p>
                <p><strong>Email:</strong> ${
                  formData.email || "Not Available"
                }</p>
                <p><strong>Subject:</strong> ${
                  formData.subject || "Not Available"
                }</p>
                <p><strong>Phone:</strong> ${
                  formData.phone || "Not Available"
                }</p>
                <p><strong>Message:</strong> ${
                  formData.message || "Not Available"
                }</p>
            </div>
        </body>
        </html>
    `;
}
