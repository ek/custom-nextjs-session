export default function CheckYourEmail() {
  return (
    <div>
      <h1>Check Your Email</h1>
      <p>Please check your email for the login link.</p>
      <a href="/otp">Return to Login</a>
      <p>If you do not see the email, please check your spam folder.</p>
      <p>If you still have issues, contact support.</p>
      <p>Thank you for your patience!</p>
      <p>If you would like to resend the email, <a href="/resend-email">click here</a>.</p>
    </div>
  )
}