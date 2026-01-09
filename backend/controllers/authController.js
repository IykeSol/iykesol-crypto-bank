exports.walletLogin = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Address, signature, and message are required'
      });
    }

    // Use web3.eth.accounts.recover instead of personal.ecRecover
    let recoveredAddress;
    try {
      recoveredAddress = web3.eth.accounts.recover(message, signature);
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed'
      });
    }

    let user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        authMethod: 'wallet',
        isVerified: true
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Wallet authentication successful',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        authMethod: user.authMethod
      }
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({
      success: false,
      message: 'Wallet authentication failed',
      error: error.message
    });
  }
};
