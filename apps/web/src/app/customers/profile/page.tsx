'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';
import { customerOrderData } from '@/services/api/order/order';
import RoleProtection from '@/services/Unauthorized';
import { ICustomerOrderData } from '@/type/customers';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { OrderListComponent } from '../../../components/Customer/profile/orderListComponent';
import { ICustomerAddressData, ICustomerAddressProfile } from '@/type/address';
import { getCustomerData } from '../../../services/api/customers/customers';
import { ICustomerData } from '@/redux/slice/customerSlice';
import { toast } from 'react-toastify';
import { getCustomerAddress } from '@/services/api/address/address';
import { CustomerAddressData } from '@/components/Customer/profile/customerAdressData';
import defaultProfile from '@/assets/images.webp';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const [orderList, setOrderList] = useState<ICustomerOrderData[]>([]);
  const [customerData, setCustomerData] = useState<ICustomerData | null>(null);
  const [addresses, setAdresses] = useState<ICustomerAddressProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const querySearch = useSearchParams().get('search');
  const [search, setSearch] = useState<string | any>('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  const customer = useAppSelector((state) => state.customer);
  const profilePict = customerData?.avatar || defaultProfile;

  const userData = useMutation({
    mutationFn: async () => {
      const { result, ok, data } = await getCustomerData(customer.customerId);
      return data;
    },
    onSuccess: (data) => {
      setCustomerData(data);
    },
    onError: (err) => {
      toast.error(err?.message);
      console.log(err);
    },
  });

  const mutation = useMutation({
    mutationFn: async (currentPage: number, qSearch?: any) => {
      const { result, ok, orderData } = await customerOrderData(
        customer.customerId,
        currentPage,
        (qSearch = search),
      );
      if (!ok) throw result.msg;
      return orderData;
    },
    onSuccess: (orderData) => {
      setOrderList(orderData);
      console.log('Set Order Data')
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const userAddress = useMutation({
    mutationFn: async () => {
      const { result, ok, address } = await getCustomerAddress(
        customer.customerId,
      );
      return address;
    },
    onSuccess: (address) => {
      setAdresses(address);
    },
    onError: (err) => {
      toast.error(err?.message);
    },
  });
  const handlePagination = (cmd: string) => {
    if (cmd == 'plus') {
      setCurrentPage((currentPage) => {
        const nextPage = currentPage + 1;
        mutation.mutate(nextPage);
        return nextPage;
      });
    } else if (cmd == 'minus') {
      setCurrentPage((prevPage) => {
        const prevPageValue = Math.max(1, prevPage - 1);
        mutation.mutate(prevPageValue);
        return prevPageValue;
      });
    }
  };
  const handleSearch = () => {
    console.log(typeof search);
    mutation.mutate(1, search);
  };
  useEffect(() => {
    userData.mutate();
    userAddress.mutate() 
  }, []);
  console.log('')
  return (
    <section className="w-full">
      {userData.isPending ? (
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col p-3">
          <div className="flex flex-col gap-4 items-center justify-center">
            <Card className="w-3/4 h-fit p-5 space-y-3 flex flex-col items-center">
              <div className="rounded-full w-44 h-44">
                <Image
                  src={profilePict}
                  alt="Profile Picture"
                  width={176}
                  height={176}
                  className="rounded-full w-44 h-44 object-cover"
                />
              </div>
              <p className="text-2xl text-center font-semibold">
                {customerData?.fullName}
              </p>
              <p className="text-lg text-center">{customerData?.email}</p>
              <Link href={'/customers/profile/edit'} className="w-full">
                <Button className="hover:bg-steel-blue w-full bg-blue-500">
                  Edit Profile
                </Button>
              </Link>
            </Card>
            <Card className="w-3/4 h-fit p-5 space-y-3 flex flex-col items-center">
              <Tabs
                defaultValue="account"
                className="w-full"
                onValueChange={(value) => {
                if (value === 'password' && orderList.length < 1) {
                    mutation.mutate(currentPage);
                }else{
                  return
                }
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Alamat</TabsTrigger>
                  <TabsTrigger value="password">Daftar Order</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <h1 className="text-left text-2xl font-semibold w-full">
                    Customer Address
                  </h1>
                  {userAddress.isPending ? (
                    <p>is loading ...</p>
                  ) : addresses && addresses.length > 0 ? (
                    <CustomerAddressData options={addresses || []} />
                  ) : (
                    <p className="text-gray-400">Alamat Tidak Ditemukan</p>
                  )}
                </TabsContent>
                <TabsContent value="password">
                  <div className="w-full flex justify-between">
                    <h1 className="text-2xl w-full text-left">My Orders</h1>
                    <div className="flex flex-row gap-3 justify-between">
                      <Input
                        name="search"
                        onChange={(e) => setSearch(e.target.value)}
                        className=""
                        placeholder="Cari No Order"
                      />
                      <Button onClick={handleSearch}>Search</Button>
                    </div>
                  </div>
                  {mutation.isPending ? (
                    <p>is loading ...</p>
                  ) : orderList && orderList.length > 0 ? (
                    <OrderListComponent
                      options={orderList}
                      currentPage={currentPage}
                    />
                  ) : (
                    <p className="text-gray-400">Order Tidak Ditemukan</p>
                  )}
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="cursor-pointer"
                          onClick={() => handlePagination('minus')}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">{currentPage}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          className="cursor-pointer"
                          onClick={() => handlePagination('plus')}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </TabsContent>
              </Tabs>
            </Card>
            {/* <Card className="w-3/4 h-fit p-5 space-y-3 flex flex-col items-center">
              <h1 className="text-left text-2xl font-semibold w-full">
                Customer Address
              </h1>
              {userAddress.isPending ? (
                <p>is loading ...</p>
              ) : addresses && addresses.length > 0 ? (
                <CustomerAddressData options={addresses || []} />
              ) : (
                <p className="text-gray-400">Alamat Tidak Ditemukan</p>
              )}
            </Card>

            <Card className="w-3/4 h-fit p-5 space-y-3 flex flex-col items-center">
              <div className="w-full flex justify-between">
                <h1 className="text-2xl w-full text-left">My Orders</h1>
                <div className="flex flex-row gap-3 justify-between">
                  <Input
                    name="search"
                    onChange={(e) => setSearch(e.target.value)}
                    className=""
                    placeholder="Cari No Order"
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
              {mutation.isPending ? (
                <p>is loading ...</p>
              ) : orderList && orderList.length > 0 ? (
                <OrderListComponent
                  options={orderList}
                  currentPage={currentPage}
                />
              ) : (
                <p className="text-gray-400">Order Tidak Ditemukan</p>
              )}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => handlePagination('minus')}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">{currentPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() => handlePagination('plus')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Card> */}
          </div>
        </div>
      )}
    </section>
  );
};

export default RoleProtection(Profile, ['customer']);
