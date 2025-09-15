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
exports.WorkerController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class WorkerController {
    getDataByEmployeeId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employeeId } = req.body;
            try {
                const getData = yield prisma_1.default.worker.findUnique({
                    where: { employeeId: employeeId },
                    include: {
                        employee: true
                    }
                });
                res.status(200).send({
                    status: 'ok',
                    msg: 'success', data: getData
                });
            }
            catch (err) {
                res.status(400).send({
                    err: err
                });
            }
        });
    }
}
exports.WorkerController = WorkerController;
