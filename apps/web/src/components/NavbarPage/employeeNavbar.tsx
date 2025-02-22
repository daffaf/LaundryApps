'use client'
import Link from 'next/link';
import logo from '../../assets/logo.png';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { workerLogoutAction } from '@/redux/slice/workerSlice';
import { useAppSelector } from '@/redux/hooks';
import { driverLogoutAction } from '@/redux/slice/driverSlice';
import { outletAdminLogoutAction } from '@/redux/slice/outletAdminSlice';
import { useRouter } from 'next/navigation';
import { superAdminLogoutAction } from '@/redux/slice/superAdminSlice';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { deleteToken } from '@/lib/server';

export default function EmployeeNavbarPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { worker, driver } = useAppSelector(
    (state) => ({
      worker: state.worker,
      driver: state.driver,
      outletAdmin: state.outletAdmin,
      superAdmin: state.superAdmin,
    }),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    if (worker || driver ) {
      if (worker) dispatch(workerLogoutAction());
      if (driver) dispatch(driverLogoutAction());
    }
    deleteToken()
    router.push('/employeeLogin');
  };

  return (
    <div className="relative flex items-center h-[55px] px-4 md:px-[45px] bg-[#fffaf0] shadow-md">
      <div className="absolute left-4 md:left-[45px]">
        <Link href={'/employee'}>
          <Image src={logo} alt="logo" width={35} className="md:w-[45px]" />
        </Link>
      </div>

      <div className="hidden md:flex flex-grow justify-center items-center gap-4 md:gap-[60px] font-semibold text-[14px] md:text-[16px] text-black">
        <Link href={'/employee'}>
          <h1>Attendance</h1>
        </Link>
        <Link href={'/workstation'}>
          <h1>WorkStation</h1>
        </Link>
      </div>

      <div className="md:hidden absolute right-4">
        <button onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-[55px] left-0 w-full bg-[#fffaf0] shadow-md flex flex-col items-center gap-4 py-4 font-semibold text-[14px] text-black md:hidden">
          <Link href={'/employee'} onClick={toggleMenu}>
            <h1>Attendance</h1>
          </Link>
          <Link href={'/workstation'} onClick={toggleMenu}>
            <h1>WorkStation</h1>
          </Link>
          <button
            onClick={handleLogout}
            className='bg-[#1678F3] rounded-md py-1 px-3 md:px-4 text-white'
          >
            LogOut
          </button>
        </div>
      )}

      <div className="absolute right-4 md:right-[45px] hidden md:flex font-semibold text-[14px] md:text-[16px] text-black">
        <button
          className="bg-[#1678F3] rounded-md py-1 px-3 md:px-4 text-white"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
