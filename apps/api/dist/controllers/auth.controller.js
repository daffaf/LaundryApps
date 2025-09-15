"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.authUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = require("../services/nodemailer");
const bcrypt_1 = require("bcrypt");
const cloudinary_1 = require("../middleware/cloudinary");
const authUser = () => {
};
exports.authUser = authUser;
class AuthController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, fullName, role, } = req.body;
            try {
                if (email) {
                    const checkEmail = yield prisma_1.default.customer.findUnique({
                        where: { email: email }
                    });
                    if (checkEmail)
                        throw Error('Email already exists');
                }
                const payload = { email: email, fullName: fullName, role: role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1h' });
                const templatePath = path_1.default.join(__dirname, '../template/verification.hbs');
                const templateSrc = fs_1.default.readFileSync(templatePath, 'utf-8');
                const compiledTemplate = handlebars_1.default.compile(templateSrc);
                const urlVerifikasi = `${process.env.BASE_URL}/verify/${token}`;
                console.log(urlVerifikasi);
                const html = compiledTemplate({
                    url: urlVerifikasi
                });
                yield nodemailer_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Verification',
                    html: html
                });
                res.status(200).send({
                    status: 'ok',
                    token: token,
                    msg: 'success register user'
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err,
                });
                console.log(err);
            }
        });
    }
    verificationUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // check user via token
                const { password, confirmPassword } = req.body;
                const payload = req.params.token;
                if (!payload)
                    throw 'invalid token';
                const verifiedToken = (0, jsonwebtoken_1.verify)(payload, process.env.SECRET_JWT);
                const customers = verifiedToken;
                const checkCustomers = yield prisma_1.default.customer.findUnique({
                    where: { email: customers.email, isVerified: false }
                });
                if (checkCustomers)
                    throw 'email already verified';
                if (confirmPassword !== password)
                    throw 'Password not match';
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashPassword = yield (0, bcrypt_1.hash)(password, salt);
                yield prisma_1.default.customer.create({
                    data: {
                        email: customers.email,
                        password: hashPassword,
                        fullName: customers.fullName,
                        isVerified: true,
                    }
                });
                res.status(200).send({
                    status: 'ok',
                });
            }
            catch (err) {
                res.status(400).send({
                    err: err
                });
            }
        });
    }
    loginCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const checkEmail = yield prisma_1.default.customer.findUnique({
                    where: { email: email }
                });
                if (!checkEmail)
                    throw new Error('Wrong Email');
                const isValidPass = yield (0, bcrypt_1.compare)(password, checkEmail === null || checkEmail === void 0 ? void 0 : checkEmail.password);
                if (!isValidPass)
                    throw new Error("wrong password");
                const payload = { customerId: checkEmail === null || checkEmail === void 0 ? void 0 : checkEmail.customerId, role: checkEmail === null || checkEmail === void 0 ? void 0 : checkEmail.role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1d' });
                res.status(200).send({
                    status: 'ok',
                    data: checkEmail,
                    token: token
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err,
                });
            }
        });
    }
    loginWorker(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, role } = req.body;
                let token = '';
                let data;
                let worker;
                let driver;
                let outletAdmin;
                let superAdmin;
                const checkEmployee = yield prisma_1.default.employee.findUnique({
                    where: { email: email, role: role }
                });
                if (!checkEmployee)
                    throw 'Wrong Email or Wrong Role';
                let employeeRole = checkEmployee.role;
                if (employeeRole === "outletAdmin") {
                    outletAdmin = yield prisma_1.default.outletAdmin.findUnique({
                        where: { employeeId: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.employeeId },
                        include: {
                            employee: true
                        }
                    });
                    if ((outletAdmin === null || outletAdmin === void 0 ? void 0 : outletAdmin.employee.role) !== 'outletAdmin')
                        throw Error("Wrong Role");
                }
                else if (employeeRole === "worker") {
                    worker = yield prisma_1.default.worker.findUnique({
                        where: { employeeId: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.employeeId },
                        include: {
                            employee: true
                        }
                    });
                }
                else if (employeeRole === "driver") {
                    driver = yield prisma_1.default.driver.findUnique({
                        where: { employeeId: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.employeeId },
                        include: {
                            employee: true
                        }
                    });
                }
                else if (employeeRole === 'superAdmin') {
                    superAdmin = yield prisma_1.default.employee.findUnique({
                        where: { employeeId: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.employeeId },
                    });
                }
                const isValidPassEmp = yield (0, bcrypt_1.compare)(password, checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.password);
                if (!isValidPassEmp)
                    throw 'Wrong Password';
                const payload = { employeeId: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.employeeId, role: checkEmployee === null || checkEmployee === void 0 ? void 0 : checkEmployee.role };
                data = checkEmployee;
                token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1d' });
                res.status(200).send({
                    status: 'ok',
                    msg: 'Login Success',
                    user: {
                        token: token,
                        data: data
                    },
                    worker: worker,
                    driver: driver,
                    outletAdmin: outletAdmin,
                    superAdmin: superAdmin,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err,
                });
            }
        });
    }
    // async loginUser(req: Request, res: Response) {
    //   try {
    //     const { email, password, role } = req.body
    //     console.log(req.body)
    //     let token: string = ''
    //     let data
    //     let worker
    //     let driver
    //     let outletAdmin
    //     let superAdmin
    //     if (!role) {
    //       const checkEmail = await prisma.customer.findUnique({
    //         where: { email: email }
    //       })
    //       if (!checkEmail) throw Error('Wrong Email')
    //       const isValidPass = await compare(password, checkEmail?.password!)
    //       if (!isValidPass) throw 'Wrong Password'
    //       const payload = { customerId: checkEmail?.customerId!, role: checkEmail?.role! }
    //       data = checkEmail
    //       token = jwtSign(payload, process.env.SECRET_JWT!, { expiresIn: '1d' })
    //     } else {
    //       const checkEmployee = await prisma.employee.findUnique({
    //         where: { email: email, role: role }
    //       })
    //       if (!checkEmployee) throw 'Wrong Email or Wrong Role'
    //       let employeeRole = checkEmployee.role
    //       if (employeeRole === "outletAdmin") {
    //         outletAdmin = await prisma.outletAdmin.findUnique({
    //           where: { employeeId: checkEmployee?.employeeId! },
    //           include: {
    //             employee: true
    //           }
    //         })
    //         if(outletAdmin?.employee.role !== 'outletAdmin') throw Error ("Wrong Role")
    //       } else if (employeeRole === "worker") {
    //         worker = await prisma.worker.findUnique({
    //           where: { employeeId: checkEmployee?.employeeId! },
    //           include: {
    //             employee: true
    //           }
    //         })
    //       } else if (employeeRole === "driver") {
    //         driver = await prisma.driver.findUnique({
    //           where: { employeeId: checkEmployee?.employeeId! },
    //           include: {
    //             employee: true
    //           }
    //         })
    //       } else if (employeeRole === 'superAdmin') {
    //         superAdmin = await prisma.employee.findUnique({
    //           where: { employeeId: checkEmployee?.employeeId! },
    //         })
    //       }
    //       const isValidPassEmp = await compare(password, checkEmployee?.password!)
    //       console.log("worker", worker)
    //       console.log("driver", driver)
    //       if (!isValidPassEmp) throw 'Wrong Password'
    //       const payload = { employeeId: checkEmployee?.employeeId!, role: checkEmployee?.role! }
    //       data = checkEmployee
    //       token = jwtSign(payload, process.env.SECRET_JWT!, { expiresIn: '1d' })
    //     }
    //     res.status(200).send({
    //       status: 'ok',
    //       msg: 'Login Success',
    //       user: {
    //         token: token,
    //         data: data
    //       },
    //       worker: worker,
    //       driver: driver,
    //       outletAdmin: outletAdmin,
    //       superAdmin: superAdmin,
    //     })
    //   } catch (err) {
    //     res.status(400).send({
    //       status: 'failed',
    //       err: err,
    //       msg: 'Error Data'
    //     })
    //   }
    // }
    changeEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newEmail } = req.body;
                const checkEmail = yield prisma_1.default.customer.findUnique({
                    where: { email: email }
                });
                if (!checkEmail)
                    throw Error('Wrong Email');
                yield prisma_1.default.customer.update({
                    where: { email: email },
                    data: { email: newEmail, isVerified: false }
                });
                const payload = { email: newEmail, fullName: checkEmail.fullName, role: checkEmail.role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1h' });
                const templatePath = path_1.default.join(__dirname, '../template/verification.hbs');
                const templateSrc = fs_1.default.readFileSync(templatePath, 'utf-8');
                const compiledTemplate = handlebars_1.default.compile(templateSrc);
                const urlVerifikasi = `${process.env.BASE_URL}/verify-email/${token}`;
                console.log(urlVerifikasi);
                const html = compiledTemplate({
                    url: urlVerifikasi
                });
                yield nodemailer_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: newEmail,
                    subject: 'Verification',
                    html: html
                });
                res.status(200).send({
                    status: 'ok',
                    message: 'Success Change Email'
                });
            }
            catch (err) {
                res.status(400).send({
                    status: "failed",
                    err: err
                });
            }
        });
    }
    sendEmailVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const checkEmail = yield prisma_1.default.customer.findUnique({
                    where: { email: email }
                });
                if (!checkEmail)
                    throw Error('Wrong Email');
                const payload = { email: email, fullName: checkEmail.fullName, role: checkEmail.role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1h' });
                const templatePath = path_1.default.join(__dirname, '../template/verification.hbs');
                const templateSrc = fs_1.default.readFileSync(templatePath, 'utf-8');
                const compiledTemplate = handlebars_1.default.compile(templateSrc);
                const urlVerifikasi = `${process.env.BASE_URL}/verify-email/${token}`;
                console.log(urlVerifikasi);
                const html = compiledTemplate({
                    url: urlVerifikasi
                });
                yield nodemailer_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Verification',
                    html: html
                });
                res.status(200).send({
                    status: 'ok',
                    message: "Email verification already send check your email"
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'fail',
                    err: err
                });
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.params.token;
                if (!payload)
                    throw 'invalid token';
                const verifiedToken = (0, jsonwebtoken_1.verify)(payload, process.env.SECRET_JWT);
                const customers = verifiedToken;
                const checkCustomers = yield prisma_1.default.customer.findUnique({
                    where: { email: customers.email, isVerified: false }
                });
                if (!checkCustomers)
                    throw 'email already verified';
                yield prisma_1.default.customer.update({
                    where: { email: customers.email, isVerified: false },
                    data: {
                        isVerified: true
                    }
                });
                res.status(200).send({
                    status: 'ok',
                    message: 'success verify email'
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
    sendResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log(email);
                const checkEmail = yield prisma_1.default.customer.findUnique({
                    where: { email: email }
                });
                if ((checkEmail === null || checkEmail === void 0 ? void 0 : checkEmail.password) === null)
                    throw 'Email not found';
                if (!checkEmail)
                    throw 'Email not found';
                const payload = { id: checkEmail.customerId, email: checkEmail.email, role: checkEmail.role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '15m' });
                const templatePath = path_1.default.join(__dirname, '../template/resetPassword.hbs');
                const templateSrc = fs_1.default.readFileSync(templatePath, 'utf-8');
                const compiledTemplate = handlebars_1.default.compile(templateSrc);
                const html = compiledTemplate({
                    url: `${process.env.BASE_URL}/customers/reset-password/${token}`
                });
                yield nodemailer_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Reset Password',
                    html: html
                });
                res.status(200).send({
                    status: 'ok',
                    msg: 'success send link reset password',
                    token: token
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'fail',
                    err: err
                });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { newPassword, confirmNewPassword } = req.body;
                if (confirmNewPassword !== newPassword)
                    throw 'Password not match';
                const stringPass = newPassword.toString();
                const payload = req.params.token;
                if (!payload)
                    throw 'invalid token';
                const verifiedToken = (0, jsonwebtoken_1.verify)(payload, process.env.SECRET_JWT);
                if (!verifiedToken)
                    throw 'token expired';
                const customers = verifiedToken;
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashPassword = yield (0, bcrypt_1.hash)(stringPass, salt);
                console.log(customers);
                yield prisma_1.default.customer.update({
                    where: { email: customers.email, customerId: customers.id },
                    data: {
                        password: hashPassword
                    },
                });
                res.status(200).send({
                    status: 'ok',
                    msg: 'success change password'
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
                console.log(err);
            }
        });
    }
    editProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId, fullName, email } = req.body;
                console.log(customerId);
                let link;
                if (req.file) {
                    const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "avatar");
                    link = secure_url;
                }
                const checkUsers = yield prisma_1.default.customer.findUnique({
                    where: { customerId: +customerId }
                });
                if (!checkUsers)
                    throw 'User Not Found';
                const newData = yield prisma_1.default.customer.update({
                    where: { customerId: +customerId },
                    data: {
                        fullName: fullName,
                        email: email,
                        avatar: link || checkUsers.avatar,
                    }
                });
                res.status(200).send({
                    status: 'ok',
                    message: "Success Edit Data",
                    data: newData
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId } = req.params;
                const customer = yield prisma_1.default.customer.findUnique({
                    where: { customerId: +customerId }
                });
                res.status(200).send({
                    status: 'ok',
                    data: customer
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
    socialLoginCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.customers;
                const payload = { id: user.id, role: user.role };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1d' });
                res.status(200).json({
                    status: 'ok',
                    msg: 'Login Success',
                    user: {
                        token,
                        data: user,
                    },
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
}
exports.AuthController = AuthController;
