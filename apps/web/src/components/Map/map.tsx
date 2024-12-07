'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Input } from '../ui/input';
import { FormikHelpers, useFormik } from 'formik';
import { ICustomerAddress } from '@/type/customers';
import {
  createAddress,
  getCity,
  getDetailLocation,
  getLngLat,
  getProvience,
  getSubDistrict,
} from '@/services/api/address/address';
import maplibregl, { LngLat, LngLatBounds } from 'maplibre-gl';
import { MapInitialize } from '@/services/map';
import { Button } from '@/components/ui/button';
import { ICity, ILocation, IProvince, ISubDis } from '@/type/address';
import { Label } from '../ui/label';
import { useAppSelector } from '@/redux/hooks';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Card } from '../ui/card';
import { useRouter } from 'next/navigation';
import { ButtonMap, handleCancel } from './action';
import LocationForm from './Component/formLocation';
import { filter } from 'cypress/types/bluebird';
import { mapSchema } from '@/schemaData/schemaData';

export default function Map() {
  const mapContainerRef = useRef<any | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);

  const [coordinates, setCoordinates] = useState<{
    lng: number | null;
    lat: number | null;
  } | null>(null);
  const [mapState, setMapState] = useState<{
    lng: number;
    lat: number;
    zoom: number;
  }>({
    lng: coordinates?.lng ? coordinates.lng : 114.30458613942182,
    lat: coordinates?.lat ? coordinates.lat : -8.432867457446378,
    zoom: 13,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [subdistricts, setSubdistricts] = useState<ISubDis[]>([]);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const subdis = useRef(null)
  const [addresses, setAddresses] = useState<ILocation[]>([]);

  const MAP_API = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const customers = useAppSelector((state) => state.customer);
  const router = useRouter();
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAP_API}`,
      center: [mapState.lng, mapState.lat],
      zoom: mapState.zoom,
    });
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setCoordinates({ lng, lat });
      setShowDialog(true);
    });

    mapRef.current = map;
  }, [MAP_API]);

  const formik = useFormik({
    initialValues: {
      addressId: 0,
      longitude: 0,
      latitude: 0,
      province: '',
      city: '',
      subdistrict: '',
      detailAddress: '',
      customerId: customers.customerId || 0,
    },
    validationSchema: mapSchema,
    onSubmit: (values, action) => {
      console.log(`values : ${values.customerId}`);
      sendDataMutation.mutate(values);
      action.resetForm();
    },
  });
  // () => {
  //   mapRef.current = new maplibregl.Map({
  //     container: mapContainerRef.current!,
  //     style: `https://api.maptiler.com/maps/streets/style.json?key=${MAP_API}`,
  //     center: [mapState.lng, mapState.lat],
  //     zoom: mapState.zoom,
  //   });
  //   setMap(mapRef.current);
  //   mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

  //   const mapClick = (e: maplibregl.MapMouseEvent) => {
  //     const { lng, lat } = e.lngLat;
  //     const newMarker = new maplibregl.Marker({}).setLngLat([lng, lat]);
  //     setCoordinates({ lng, lat });
  //     setShowDialog(true);
  //   };
  //   if (marker?._lngLat === undefined) {
  //     mapRef.current.on('click', mapClick);
  //   } else {
  //     mapRef.current.off('click', mapClick);
  //   }
  // };
  const handleConfirm = useCallback(() => {
    if (!coordinates || !mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();

      const newMarker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([coordinates?.lng!, coordinates?.lat!])
        .addTo(mapRef.current);

      markerRef.current = newMarker;
    }
    formik.setFieldValue('longitude', coordinates?.lng);
    formik.setFieldValue('latitude', coordinates?.lat);

    if (!markerRef.current) {
      const newMarker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([coordinates?.lng!, coordinates?.lat!])
        .addTo(mapRef.current);

      markerRef.current = newMarker;
    }

    // setShowMap(false);
    setShowDialog(false);
  }, [coordinates, formik]);
console.log(coordinates)
  // () => {

  //   const lng = coordinates?.lng!;
  //   const lat = coordinates?.lat!;

  //   if (lng !== undefined && lat !== undefined && marker === null) {

  //     console.log('Marker confirmed at: ', coordinates);
  //   } else {
  //     console.error('Coordinate already set');
  //   }
  // };

  const fetchLocation = useCallback(async () => {
    try {
      const { result, ok, location } = await getDetailLocation();
      setAddresses(location);
      console.log(location)
      if (!ok) throw new Error(result.msg);
      const filterProvince = Array.from(
              new Set(location.map((item: any) => item.province)),
            ).map((province) => ({ province })) as IProvince[];
            setProvinces(filterProvince)
      setProvinces(filterProvince);
      console.log(provinces)
    } catch (error) {
      toast.error('Failed to fetch location data');
    }
  }, []);
  const sendDataMutation = useMutation({
    mutationFn: async (data: ICustomerAddress) => await createAddress(data),
    onSuccess: (data) => {
      const { result, ok } = data;
      if (!ok) throw result.msg;
      console.log('clicked');
      marker?.remove();
      setMarker(null);
      // setSelectedProvince('');
      // setSelectedCity('');
      // setSelectedSubdistrict('');
      toast.success(result.msg || 'Berhasil Menambah Alamat');
      router.push('/customers/profile');
    },
    onError: (err) => {
      toast.error(err?.message || 'Gagal Mengirim Data');
      router.refresh();
      console.log(err);
    },
  });

  const handleShowMap = () => {
    if (!showMap) setShowMap(true);
  };
  // const locationMutation = useMutation({
  //   mutationFn: async () => {
  //     const { result, ok, location } = await getDetailLocation();
  //     if (!ok) throw result.msg;
  //     return location;
  //   },
  //   onSuccess: (location) => {
  //     setAddresses(location);
  //     const filterProvince = Array.from(
  //       new Set(location.map((item: any) => item.province)),
  //     ).map((province) => ({ province })) as IProvince[];
  //     setProvinces(filterProvince);
  //   },
  //   onError: (err) => {
  //     console.log(err);
  //   },
  // });
  const handleSelect = (field: string, value: string, cb?: () => void) => {
    formik.setFieldValue(field, value);
    if (field === 'province') {
      setSelectedProvince(value);
      if (value != '') {
        // setSelectedCity('');
        // setSelectedSubdistrict('');
      }
    } else if (field === 'city') {
      setSelectedCity(value);
      if (value != '') {
        // setSelectedSubdistrict('');
      }
    } else if (field === 'subdistrict') {
      // setSelectedSubdistrict(value);
      
      if (cb) cb();
    }
  };

  const handleSelectSubdistric = async (value: string) => {
    let city = selectedCity.replace(/^(KAB\.|KOTA)\s*/, '');
    let address = `${value},${city}`;
    try {
      const { result, ok, resLng, resLat } = await getLngLat(address);
      console.log(result);
      if (!ok) throw result.msg;
      setCoordinates({
        lat: parseFloat(resLat),
        lng: parseFloat(resLng),
      });
    } catch (err) {
      console.log(err);
      toast.error('Error Get Map');
    }
    handleSelect('subdistrict', value);
  };
  // useEffect(() => {
  //   // locationMutation.mutate();
  //   if (selectedProvince != '') {
  //     const filterCity = Array.from(
  //       new Set(
  //         addresses
  //           .filter(
  //             (item: ILocation) =>
  //               item.province === selectedProvince.toUpperCase(),
  //           )
  //           .map((item: ILocation) => item.city),
  //       ),
  //     ).map((city) => ({ city })) as ICity[];
  //     setCities(filterCity);

  //   } else {
  //     setCities([]);
  //   }

  //   if (selectedCity != '') {
  //     const filterSubdistrict = Array.from(
  //       new Set(
  //         addresses
  //           .filter(
  //             (item: ILocation) => item.city === selectedCity.toUpperCase(),
  //           )
  //           .map((item: ILocation) => item.subdistrict),
  //       ),
  //     ).map((subdistrict) => ({ subdistrict })) as ISubDis[];
  //     setSubdistricts(filterSubdistrict);
  //   } else {
  //     setSubdistricts([]);
  //   }
  // }, [selectedProvince, selectedCity]);
  useEffect(() => {
    if (formik.values.province) {
      const filterCity = Array.from(
        new Set(
          addresses
            .filter(
              (item: ILocation) =>
                item.province === formik.values.province.toUpperCase(),
            )
            .map((item: ILocation) => item.city),
        ),
      ).map((city) => ({ city })) as ICity[];
      setCities(filterCity);
    } else {
      setCities([]);
    }

    if (formik.values.city) {
      const filterSubdistrict = Array.from(
        new Set(
          addresses
            .filter(
              (item: ILocation) => item.city === selectedCity.toUpperCase(),
            )
            .map((item: ILocation) => item.subdistrict),
        ),
      ).map((subdistrict) => ({ subdistrict })) as ISubDis[];
      setSubdistricts(filterSubdistrict);
    }else{
      setSubdistricts([])
    }
  }, [formik.values.province, formik.values.city]);
  // useEffect(() => {
  //   if (!map) initMap();
  // }, [map, marker, mapState]);
  useEffect(() => {
    if (!map) initMap();
    fetchLocation()
  }, [fetchLocation]);

  useEffect(() => {
    if (mapRef.current && coordinates) {
      mapRef.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 12,
        speed: 1.2,
        curve: 1.42,
        easing: (t: any) => t,
      });
    }
  }, [coordinates, mapState]);
  return (
    <section className="flex flex-col items-center mt-24 w-full h-screen">
      <Card className="w-3/4 p-5">
        <div className="">
          {
            <div className="mt-5 ">
              <LocationForm
                formik={formik}
                provinces={provinces}
                cities={cities}
                subdistricts={subdistricts}
                customers={customers}
                handleSelectProvinsi={(value: string) =>{

                  handleSelect('province', value)
                }
                }
                handleSelectCity={(value: string) =>
                  handleSelect('city', value)
                }
                handleSelectSubdistric={handleSelectSubdistric}
                marker={markerRef.current}
                sendDataMutation={sendDataMutation}
              />
            </div>
          }
          {showDialog && (
            <div className="fixed z-10 p-6 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg top-1/2 left-1/2">
              <h3 className="mb-3 text-lg font-semibold">
                {marker !== null
                  ? 'Delete Previous Location?'
                  : 'Confirm this location?'}
              </h3>
              <div className="flex justify-end mt-4 space-x-4">
                <ButtonMap
                  title="Confirm"
                  onClick={handleConfirm}
                  className={`bg-green-500 rounded-md hover:bg-green-600 ${marker != null ? 'hidden' : ''}`}
                />
                <ButtonMap
                  title="Delete"
                  className={`bg-red-500 rounded-md hover:bg-red-600 ${markerRef != null ? '' : 'hidden'}`}
                  onClick={() =>
                    handleCancel({
                      formik,
                      marker,
                      setMarker,
                      setShowDialog,
                      setCoordinates,
                    })
                  }
                />
              </div>
            </div>
          )}
          {/* ${selectedSubdistrict != '' ? '' : 'hidden'} */}
          <ButtonMap
            title="Atur Coordinate"
            className={`mt-3 bg-blue-500 rounded-md hover:bg-blue-600 `}
            onClick={handleShowMap}
            disabled = {formik.values.subdistrict ? false : true}
          />
        </div>
      </Card>
      <div
        ref={mapContainerRef}
        className={`w-3/4 h-[300px] border-2 border-black rounded-md shadow-md p-3 ${showMap ? 'flex relative overflow-hidden' : 'hidden'}`}
      />
    </section>
  );
}
