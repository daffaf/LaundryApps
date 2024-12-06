'use client';

import { OrderItemsModal } from '@/components/Order/orderItemsModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppSelector } from '@/redux/hooks';
import { snapPayment } from '@/services/api/order/order';
import {
  ICustomerOrderData,
  ICustomerPayment,
  orderItems,
} from '@/type/customers';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { ListOrderedIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';

const tableHeader = [
  { title: 'No' },
  { title: 'No Order' },
  { title: 'Outlet' },
  { title: 'Tanggal Order' },
  { title: 'Status Order' },
  { title: 'Status Pembayaran' },
  { title: 'Berat (Kg)' },
  { title: 'Total Pembayaran' },
  { title: 'Actions' },
];
interface OrderListProps {
  options: ICustomerOrderData[];
  currentPage: number;
}

export const OrderListComponent: FC<OrderListProps> = ({
  options,
  currentPage,
}) => {
  const [orderItems, setOrderItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const customer = useAppSelector((state) => state.customer);
  const router = useRouter();
  const pageSize = 5;
  const paymentMutation = useMutation({
    mutationFn: async (data: ICustomerPayment) => {
      const { result, ok } = await snapPayment(data);
      return result;
    },
    onSuccess: (result) => {
      console.log(result.data);
      router.push(`${result.data.redirect_url}`);
    },
    onError: (err) => {
      console.log(err);
      toast.error(`Pembayaran Gagal Mohon Coba Lagi`);
    },
  });
  const itemsModalOpen = async (orderInvoice: string, items: []) => {
    setOrderItems(items);
    setIsOpen(true);
  };
  const itemsModalClose = () => {
    setIsOpen(false);
  };
  console.log(orderItems);
  const handlePayment = (order: ICustomerOrderData) => {
    formik.setValues({
      orderInvoice: order.orderInvoice,
      customerId: customer.customerId,
      weight: order.weight,
      price: order.pricePerKg,
    });
    formik.handleSubmit();
  };
  const formik = useFormik({
    initialValues: {
      orderInvoice: '',
      customerId: customer.customerId,
      weight: 0,
      price: 0,
    },
    onSubmit(values, action) {
      console.log(values);
      paymentMutation.mutate(values);
    },
  });
  const availableStatusPayment = [
    'pencucian',
    'penyetrikaan',
    'packing',
    'menungguPembayaran',
  ];
  return (
    <div className="w-full overflow-x-auto">
      {/* {options.map((option, index) => (
        <Card>
         
          <CardContent className="text-sm">
          <div className='my-3'>
          <div className="flex flex-row justify-between">
              <ListOrderedIcon></ListOrderedIcon>
              <div className='flex flex-row gap-3'>
                <div
                  className={
                    `px-3 rounded-md ${option.status === 'Menunggu Konfimasi'}`
                      ? 'text-yellow-500 bg-yellow-200'
                      : 'text-black'
                  }
                >
                  {option.status}
                </div>
                <p className='text-gray-400'>{format(option.createdAt, 'yyyy-MM-dd')}</p>
              </div>
              <span>{option.orderInvoice}</span>
            </div>
          </div>
          
            <p className="font-semibold text-base">{option.outlet.name}</p>
            <p>{`${option.items.length} Items`}</p>
            <p>{`${option.weight} Kg x ${option.pricePerKg}`}</p>
            <div className="w-full text-right text-base">
              <p>Total Harga</p>
              <p>{`${option.total == undefined || null ? '0' : option.total}`}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row gap-3 justify-end">
            {availableStatusPayment.includes(option.status) &&
            option.paymentStatus == 'unpaid' ? (
              <Button
                onClick={() => handlePayment(option)}
                className="bg-blue-500"
              >
                Bayar
              </Button>
            ) : (
              ''
            )}
            <Button
              className="bg-blue-500"
              onClick={() => itemsModalOpen(option.orderInvoice, option.items)}
            >
              Items
            </Button>
          </CardFooter>
        </Card>
      ))} */}

      <Table>
        <TableHeader className='text-left'>
          <TableRow>
            {tableHeader.map((header) => (
              <TableHead
                className="px-4 py-2 text-left whitespace-normal"
                key={header.title}
              >
                {header.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((order, index) => (
            <TableRow key={index}>
              <TableCell className='text-center'>{(currentPage - 1) * pageSize + index + 1}</TableCell>
              <TableCell className="px-4 py-2 whitespace-normal">
                {order.orderInvoice}
              </TableCell>
              <TableCell className="px-4 py-2 whitespace-normal">
                {order.outlet?.name || 'N/A'}
              </TableCell>
              <TableCell className="px-2 py-2 whitespace-normal">
                {format(order.createdAt, 'yyyy-MM-dd')}
              </TableCell>
              <TableCell className="px-0 py-2 whitespace-normal">
                {order.status}
              </TableCell>
              <TableCell className="px-4 py-2 whitespace-normal">
                {order.paymentStatus}
              </TableCell>
              <TableCell className="px-4 py-2 text-right whitespace-normal">
                {order.weight}
              </TableCell>
              <TableCell className="px-4 py-2 text-right whitespace-normal">
                {(order.pricePerKg * order.weight).toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                })}
              </TableCell>
              <TableCell className="flex flex-col items-center gap-1">
                {availableStatusPayment.includes(order.status) &&
                order.paymentStatus == 'unpaid' ? (
                  <Button
                    onClick={() => handlePayment(order)}
                    className="bg-blue-500"
                  >
                    Bayar
                  </Button>
                ) : (
                  ''
                )}
                <Button
                  className="bg-blue-500"
                  onClick={() =>
                    itemsModalOpen(order.orderInvoice, order.items)
                  }
                >
                  Items
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {isOpen === true ? (
            <OrderItemsModal
              orderItems={orderItems}
              isOpen={isOpen}
              itemsModalClose={itemsModalClose}
            />
          ) : (
            ''
          )}
        </TableBody>
      </Table>
    </div>
  );
};
