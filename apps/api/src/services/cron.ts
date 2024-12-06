import { PrismaClient } from "@prisma/client";
import cron from 'node-cron'

const prisma = new PrismaClient()

cron.schedule('* * * * *', async () => {
    console.log('Running Cron Job auto confirmation');
    await completedOrder()
});

async function completedOrder (){
    try {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - 48);
        await prisma.order.updateMany({
          where: {
            status: 'sedangDikirim',
            deliverDate: thresholdDate,
          },
          data: {
            status: 'selesai',
          },
        });
        console.log('Auto-confirmation job completed successfully.');
    } catch (err) {
        console.error('Error in auto-confirmation job:', err);
    } finally {
        await prisma.$disconnect()
    }
}