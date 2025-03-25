import * as React from 'react';

interface OTPEmailTemplateProps {
  otpCode: string;
}

export const EmailTemplate: React.FC<Readonly<OTPEmailTemplateProps>> = ({
  otpCode,
}) => (
  <div>
    <h1>One-time password code: {otpCode}</h1>
    <p>Please use this code to verify your identity.</p>
    <p>This code will expire in 10 minutes.</p>
  </div>
);
