const bcrypt = require("bcrypt");
const User = require("../models").User;
const OTP = require("../models").otp;
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models").profile;
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const response = await OTP.findAll({
        where: { email },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      console.log(response);

      if (response.length === 0) {
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      } else if (otp !== response[0].otp) {
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      }
    const hashedPassword = await bcrypt.hash(password, 10);
    let approved = "";
    approved === "Student" ? (approved = false) : (approved = true);
const profileDetails = await Profile.create({
  gender: null,
  dateOfBirth: null,
  about: null,
  contactNumber: null,
});
const user = await User.create({
  firstName,
  lastName,
  email,
  contactNumber,
  password: hashedPassword,
  accountType: accountType,
  approved: approved,
  image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
});

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }
  if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};


exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ where: { email: email } });
    
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    console.log("Email verification is done");

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp", otp);

    async function sendVerificationEmail(email, otp) {
      try {
        const mailResponse = await mailSender(
          email,
          "Verification Email",
          emailTemplate(otp)
        );
        console.log("Email sent successfully: ", mailResponse.response);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    }

    OTP.afterCreate(async (otpInstance) => {
      console.log("New document saved to database");
      await sendVerificationEmail(otpInstance.email, otpInstance.otp);
    });
    let result = await OTP.findOne({ where: { otp: otp } });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ where: { otp: otp } });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } 
  catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {  
    const userDetails = await User.findOne({
      where:{
        id:req.user.id
      }
    });
    const { oldPassword, newPassword } = req.body;
    console.log("Oldpassword,newPassword",oldPassword,newPassword)
    const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "The password is incorrect" });
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const [updatedRowsCount, updatedUserDetails] = await User.update(
      { password: encryptedPassword },
      {
        where: {
          id: req.user.id,
        },
        returning: true, 
      }
    );
    if (updatedRowsCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (updatedRowsCount > 0) {
      const updatedUserDetails = updatedRowsCount[0];
      console.log('User details updated:', updatedUserDetails);
    } else {
      console.log('User not found or password not updated.');
    }
    try {
      const emailResponse = await mailSender(
        updatedUserDetails[0].email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails[0].email,
          `Password updated successfully for ${updatedUserDetails[0].firstName} ${updatedUserDetails[0].lastName}`
        )
      );
      console.log("Email sent successfully............................:", emailResponse.response);
    } catch (error) {
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};



