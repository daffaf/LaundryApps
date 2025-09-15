"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { PrismaClient } from '../prisma/generated/client';
const client_1 = require("@prisma/client");
exports.default = new client_1.PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
