import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import emailjs from '@emailjs/browser';

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP Verification State
  const [step, setStep] = useState(1);
  const [sentOtp, setSentOtp] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useRef();

  // STEP 1: Handle initial signup click (Send OTP via EmailJS)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // 1. Generate local OTP
    const generatedOtp = generateOTP();

    // 2. Configure EmailJS Parameters
    // We pass these variables securely to the EmailJS template.
    // By passing multiple aliases for the recipient email, we ensure it works
    // regardless of whether the user's template expects {{to_email}}, {{email}}, or {{to_name}}
    const templateParams = {
      to_email: email,
      to_name: email,
      email: email,
      // Pass the OTP with multiple aliases in case the template uses a different name
      otp_code: generatedOtp,
      message: generatedOtp,
      code: generatedOtp,
      otp: generatedOtp,
      OTP: generatedOtp,
      reply_to: 'no-reply@ims.com'
    };

    try {
      // 3. Send Email using Vite Environment Variables
      console.log('Using Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
      
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_placeholder',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_placeholder',
        templateParams,
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_placeholder',
        }
      );
      
      // Save the OTP in state and move to Step 2
      setSentOtp(generatedOtp);
      setStep(2);
    } catch (err) {
      console.error('EmailJS Error:', err);
      // Surface the specific API error from EmailJS if it exists (e.g. err.text or err.message)
      const errorMsg = err?.text || err?.message || 'Unknown EmailJS error';
      setError(`Failed to send verification email. Configuration Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Register user in Database
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (enteredOtp !== sentOtp) {
      setError('Invalid verification code.');
      setLoading(false);
      return;
    }

    try {
      // Create user in the backend now that they are verified
      const { token, user } = await api.register({ email, password });
      login(token, user); // Auto-login after registration
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <h2>IMS Sign Up</h2>
        <p className="auth-subtitle">Verify your email to create an account</p>

        {error && <div className="auth-alert error">{error}</div>}

        {step === 1 ? (
          <form ref={form} onSubmit={handleSendOTP} className="auth-form slide-up">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="to_email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending Code...' : 'Verify Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form slide-up">
            <div className="auth-alert success" style={{ marginBottom: 'var(--space-4)' }}>
              Verification code sent to <strong>{email}</strong>
            </div>

            <div className="form-group">
              <label>6-Digit Code</label>
              <input
                type="text"
                required
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: 'var(--font-size-xl)' }}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating Account...' : 'Confirm & Register'}
            </button>
            
            <button 
               type="button" 
               onClick={() => setStep(1)} 
               className="auth-button" 
               style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Back
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In here</Link>
          </div>
        )}
      </div>
    </div>
  );
}
