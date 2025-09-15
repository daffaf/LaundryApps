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
const client_1 = require("@prisma/client");
const node_cron_1 = __importDefault(require("node-cron"));
const prisma = new client_1.PrismaClient();
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running Cron Job auto confirmation');
    yield completedOrder();
}));
function completedOrder() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const thresholdDate = new Date();
            thresholdDate.setHours(thresholdDate.getHours() - 48);
            yield prisma.order.updateMany({
                where: {
                    status: 'sedangDikirim',
                    deliverDate: thresholdDate,
                },
                data: {
                    status: 'selesai',
                },
            });
            console.log('Auto-confirmation job completed successfully.');
        }
        catch (err) {
            console.error('Error in auto-confirmation job:', err);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
