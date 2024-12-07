'use client';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import * as yup from 'yup';

export const customerDataSchema = yup.object().shape({
  addressId: yup.number().required().moreThan(0, 'Alamat Wajib Dipilih'),
  customerId: yup.number().required(),
});
const today = startOfDay(new Date());
const maxDate = addDays(today, 7);
export const orderDataSchema = yup.object().shape({
  customerId: yup.number().required(),
  outletId: yup.number().required(),
  addressId: yup.number().required('Alamat Wajib Diisi'),
  pickupDate: yup.date().required('Tanggal Pickup Wajib Diisi').test(
    "is-within-date-range",
    `Pickup date must be between ${today.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
      (value) => value && !isBefore(value, today) && !isAfter(value, maxDate)
  ),
  pickupTime: yup.string().required('Waktu Pengambilan Wajib Diisi'),
});
export const mapSchema = yup.object().shape({
  province: yup.string().required('Provinsi Tidak Boleh Kosong'),
  city: yup.string().required('Kabupaten / Kota Tidak Boleh Kosong'),
  subdistrict: yup.string().required('Kecamatan Tidak Boleh Kosong'),
  detailAddress: yup.string().required('Alamat Lengkap Tidak Boleh Kosong'),
  longitude: yup.string().required(),
  latitude: yup.string().required(),
  customerId: yup.string().required(),
});

export const OutletSchema = yup.object().shape({
  name: yup.string().required('Outlet name is required'),
  provinsi: yup.string().required(),
  kota: yup.string().required(),
  kecamatan: yup.string().required(),
  longitude: yup.string().required(),
  latitude: yup.string().required(),
});
