const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const auth = require('../middleware/auth');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: username, email, password' });
    }

    // Validate password strength
    const passwordValidation = User.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase().trim() }, { email: email.toLowerCase().trim() }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: existingUser.username === username.toLowerCase().trim()
          ? 'Username already exists'
          : 'Email already exists'
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save hook
      name: name ? name.trim() : '',
      provider: 'local'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user by username or email (need to explicitly select password)
    const user = await User.findOne({
      $or: [{ username: username.toLowerCase().trim() }, { email: username.toLowerCase().trim() }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if user is active
    if (!user.isValid()) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// SEND OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Validate phone format
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { phone },
      { code, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 minute expiry
      { upsert: true, new: true }
    );

    // Send OTP via Twilio
    try {
      await client.messages.create({
        body: `Your Sèvres verification code is: ${code}\n\nValid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    } catch (twilioErr) {
      console.warn('Twilio error:', twilioErr.message);
      // Don't fail the request - OTP is saved in DB for testing
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord) {
      return res.status(401).json({ error: 'OTP expired or not found' });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteOne({ phone });
      return res.status(401).json({ error: 'OTP expired' });
    }

    // Verify OTP code
    if (otpRecord.code !== otp.toString().trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ phone });
        return res.status(429).json({ error: 'Too many attempts. Request a new OTP.' });
      }

      return res.status(401).json({
        error: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
      });
    }

    // OTP verified - delete it
    await OTP.deleteOne({ phone });

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        phone,
        username: `user_${phone.slice(-10)}`,
        email: `${Date.now()}_${phone}@sevres.local`, // Generate unique email
        provider: 'phone'
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name || 'User'
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// GOOGLE OAUTH
router.post('/oauth', async (req, res) => {
  try {
    const { email, name, username, provider } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ error: 'Email and provider required' });
    }

    if (!['google', 'github', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid OAuth provider' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = new User({
        email: email.toLowerCase().trim(),
        username: username || email.split('@')[0],
        name: name ? name.trim() : '',
        provider
      });
    } else {
      // If user exists with different provider, allow linking
      if (user.provider !== provider) {
        // Could implement account linking here
        console.log(`User ${email} authenticating with ${provider} (currently ${user.provider})`);
      }
      user.provider = provider;
    }

    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'OAuth login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).json({ error: 'OAuth login failed' });
  }
});

// GET CURRENT USER (Protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;