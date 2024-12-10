'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { customerDataSchema, orderDataSchema } from '@/schemaData/schemaData';
import { getCustomerAddress } from '@/services/api/address/address';
import {
  createPickupOrder,
  getNearOutlet,
  IOrderPickup,
} from '@/services/api/customers/pickupOrders';
import {
  IAddress,
  ICustomerAddressData,
  ICustomerAddressProfile,
} from '@/type/address';
import { IOutletData } from '@/type/outlet';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  isTomorrow,
  parse,
  startOfDay,
} from 'date-fns';
import { FormikHelpers, useFormik } from 'formik';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { jadwalPickup } from './Utils';
import { getFilteredTimeslots } from './Helper';
import { SelectAddress } from './AddressSelect';

export const CustomerPickupPage = () => {
  const [foundOutlet, setFoundOutlet] = useState<IOutletData[]>([]);
  const [customerAddress, setCustomerAddress] = useState<
    ICustomerAddressProfile[]
  >([]);
  const [date, setDate] = useState<Date>();
  const [address, setAddress] = useState<ICustomerAddressData>();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const customer = useAppSelector((state) => state.customer);
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      addressId: 0,
      customerId: 0,
    },
    validationSchema: customerDataSchema,
    onSubmit: (values, action) => {
      console.log(values);
      // getOutlet(values, action)
      if (values.addressId === 0 && values.customerId === 0)
        toast.error('Data Anda Belum Lengkap');
      outletData.mutate(values);
    },
  });
  const pickupFormik = useFormik({
    initialValues: {
      addressId: 0,
      customerId: 0,
      outletId: 0,
      pickupDate: new Date(''),
      pickupTime: '',
    },
    validationSchema: orderDataSchema,
    onSubmit: (values, action) => {
      // pickupRequest(values, action)
      pickupMutation.mutate(values);
      action.resetForm();
    },
  });
  const outletData = useMutation({
    mutationFn: async (data: IAddress) => {
      const { result, ok, nearOutlet } = await getNearOutlet(data);
      return nearOutlet;
    },
    onSuccess: (nearOutlet) => {
      setFoundOutlet(nearOutlet);
    },
    onError: (err) => {
      toast.error(err?.message);
    },
  });
  const userAddress = useMutation({
    mutationFn: async (customerId: number) => {
      const { result, ok, address } = await getCustomerAddress(customerId);
      console.log(`pickup result address: ${result}`);
      return address;
    },
    onSuccess: (address) => {
      setCustomerAddress(address);
    },
    onError: (err) => {
      toast.error(err?.message);
    },
  });
  const pickupMutation = useMutation({
    mutationFn: async (data: IOrderPickup) => {
      const { result, ok } = await createPickupOrder(data);
      return { data, result };
    },
    onSuccess: (data, result) => {
      toast.success('Sukses Order');
      setOpenDialog(false);
      setAddress(undefined);
      router.push('/customers/profile');
    },
    onError: (err) => {
      toast.error(err?.message);
    },
  });

  const handleSelectAddress = (value: string) => {
    formik.setFieldValue('addressId', value);
    formik.setFieldValue('detailAddress', value);
    formik.setFieldValue('customerId', customer.customerId);

    pickupFormik.setFieldValue('addressId', parseInt(value));
    const selectedDetailAddress = customerAddress.find(
      (data) => data.addressId.toString() === value,
    );
    setAddress(selectedDetailAddress);
    pickupFormik.setFieldValue('customerId', customer.customerId);
  };
  const handleId = (e: any) => {
    pickupFormik.setFieldValue('outletId', parseInt(e.target.value));
  };
  const handleSelectTime = (value: string) => {
    pickupFormik.setFieldValue('pickupTime', value);
  };
  const handleSelectDate = (value: Date | undefined) => {
    setOpenCalendar(false);
    setDate(value);
    pickupFormik.setFieldValue('pickupDate', value);
  };
  const sortCustomerAddress = customerAddress.sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
  );

  const now = new Date();
  const currentTime = format(new Date(), 'HH:mm');
  // const currentTime = '18:04'// Example: "10:04"
  const today = startOfDay(now);
  const maxDate = addDays(today, 7);
  // Normalize function to match the 'HH:mm' format for start/end times
  const normalizeTime: any = (time: string): string => {
    return time; // Assuming the input time is in 'HH:mm' format already
  };

  // Filter jadwalPickup based on current time
  const availablePickupTimes = jadwalPickup.filter((schedule) => {
    if (pickupFormik.values.pickupDate > today) {
      return true;
    }
    const now = parse(normalizeTime(currentTime), 'HH:mm', new Date());
    const startTime = parse(normalizeTime(schedule.start), 'HH:mm', new Date());
    const endTime = parse(normalizeTime(schedule.end), 'HH:mm', new Date());

    console.log('Now:', now);
    console.log('Start:', startTime);
    console.log('End:', endTime);
    const isTimeInRange = isBefore(now, endTime);

    console.log('Is in range:', isTimeInRange);

    return isTimeInRange;
  });

  console.log('Filtered Times:', availablePickupTimes);

  console.log(availablePickupTimes);
  useEffect(() => {
    userAddress.mutate(customer.customerId);
  }, []);
  return (
    <section className="flex flex-col items-center w-full h-screen gap-10">
      <Card className="w-3/4 p-5 mt-32">
        <form onSubmit={formik.handleSubmit} className="space-y-3">
          <SelectAddress 
            onValueChange={handleSelectAddress}
            name='addressId'
            placeholder='Pilih Alamat'
            option={sortCustomerAddress}
          />
          {formik.submitCount > 0 && formik.errors.addressId && (
            <p className="text-red-500 text-sm">{formik.errors.addressId}</p>
          )}
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[100%] justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                // onSelect={(date) => handleSelectDate(date as Date)}
                onSelect={handleSelectDate}
                disabled={(date) =>
                  isBefore(date, today) || isAfter(date, maxDate)
                }
              />
            </PopoverContent>
          </Popover>

          <Select
            onValueChange={handleSelectTime}
            name="pickupTime"
            disabled={
              pickupFormik?.values?.pickupDate
                ? pickupFormik.values.pickupDate.toString() === 'Invalid Date'
                : true
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Waktu Pickup" />
            </SelectTrigger>
            <SelectContent>
              {availablePickupTimes && availablePickupTimes.length > 0 ? (
                availablePickupTimes.map((jadwal, index) => (
                  <SelectItem value={jadwal.rng} key={index}>
                    {jadwal.rng}
                  </SelectItem>
                ))
              ) : (
                <p className="text-sm text-red-500 w-full text-center">
                  Jadwal Hari Ini Tidak Ada
                </p>
              )}
            </SelectContent>
          </Select>

          <button
            className="w-full p-3 text-white bg-blue-500 rounded-md"
            type="submit"
          >
            {outletData.isPending ? 'Loading ...' : 'Cari'}
          </button>
        </form>
      </Card>
      {foundOutlet && foundOutlet.length > 0 ? (
        <Card className="w-3/4">
          {foundOutlet.map((data: IOutletData, index) => (
            <div key={index} className="w-full p-5 border rounded-md ">
              <form
                onSubmit={pickupFormik.handleSubmit}
                className="flex flex-row items-end justify-between"
              >
                <div>
                  <p>{`Nama Outlet : ${data.name}`}</p>
                  <p>{`Kecamatan : ${data.kecamatan}`}</p>
                  <p>{`Kota : ${data.kota}`}</p>
                  <p>{`Provinsi : ${data.provinsi}`}</p>
                  <p>{`Jarak dari lokasi anda : ${data.jarak}`}</p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      onClick={handleId}
                      value={data.outletId}
                    >
                      Pilih Outlet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle hidden></DialogTitle>
                    <DialogHeader>
                      <h1 className="text-2xl font-semibold">
                        Apakah Data anda sudah sesuai ?
                      </h1>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                      <Label>Nama Outlet</Label>
                      <p className='font-semibold text-black'>{data.name}</p>
                      <Label>Alamat Lengkap</Label>
                      <p className='font-semibold text-black'>{address?.detailAddress}</p>
                      <Label>Tanggal Pickup</Label>
                      {/* <p>{pickupFormik.values.customerId}</p> */}
                      
                      <p className='font-semibold text-black'>{format(pickupFormik.values.pickupDate, 'yyyy-MM-dd')}</p>
                      <Label>Waktu Pickup</Label>
                      <p className='font-semibold text-black'>{pickupFormik.values.pickupTime}</p>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={() => pickupFormik.handleSubmit()}
                        className="w-full"
                      >
                        Order
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </form>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="w-3/4 rounded-md text-center">
          <p>Outlet Tidak Tersedia</p>
        </Card>
      )}
    </section>
  );
};
